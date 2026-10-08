import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Called by the Supabase `notify_new_message` trigger (pg_net) after each
// messages INSERT. Looks the message up server-side, so a forged call can at
// worst re-notify a real message — and the throttle window absorbs that.
export async function POST(req: Request) {
  const secret = process.env.MESSAGE_NOTIFY_SECRET
  const resendKey = process.env.RESEND_API_KEY
  if (!secret || !resendKey) {
    return NextResponse.json({ error: 'Notifications not configured' }, { status: 503 })
  }
  if (req.headers.get('x-notify-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let messageId: string | null = null
  try {
    const body = await req.json()
    messageId = body?.message_id ?? null
  } catch {
    /* fall through */
  }
  if (!messageId) return NextResponse.json({ error: 'message_id required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: msg } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, created_at')
    .eq('id', messageId)
    .maybeSingle()
  if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id, dog_id, dogs(title)')
    .eq('id', msg.conversation_id)
    .maybeSingle()
  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const recipientId = msg.sender_id === conv.buyer_id ? conv.seller_id : conv.buyer_id

  // Throttle: if the same sender already wrote in this conversation within the
  // last hour (before this message), the recipient was already notified.
  const { count: recent } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conv.id)
    .eq('sender_id', msg.sender_id)
    .neq('id', msg.id)
    .lt('created_at', msg.created_at)
    .gt('created_at', new Date(new Date(msg.created_at).getTime() - 60 * 60 * 1000).toISOString())
  if ((recent ?? 0) > 0) {
    return NextResponse.json({ skipped: 'throttled' })
  }

  const { data: recipient } = await supabase.auth.admin.getUserById(recipientId)
  const email = recipient?.user?.email
  if (!email) return NextResponse.json({ error: 'Recipient has no email' }, { status: 404 })

  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name, kennel_name')
    .eq('id', msg.sender_id)
    .maybeSingle()
  const senderName = senderProfile?.kennel_name || senderProfile?.full_name || 'A GunDog Exchange member'
  const dogTitle = (conv.dogs as unknown as { title: string } | null)?.title ?? 'your listing'
  const preview = msg.body.length > 160 ? msg.body.slice(0, 157) + '…' : msg.body
  const threadUrl = `https://gundogexchange.com/dashboard/messages/${conv.id}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'GunDog Exchange <noreply@gundogexchange.com>',
      to: [email],
      subject: `New message about ${dogTitle}`,
      text: `${senderName} sent you a message about ${dogTitle}:\n\n"${preview}"\n\nReply here: ${threadUrl}\n\n— GunDog Exchange`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0E0E0E">
          <div style="background:#0E0E0E;padding:16px 24px">
            <span style="color:#D4600A;font-weight:900;font-size:18px">GUNDOG</span>
            <span style="color:#F4EFE5;font-weight:900;font-size:18px"> EXCHANGE</span>
          </div>
          <div style="padding:24px;background:#FAF7EF;border:1px solid #D9C8A6">
            <p style="font-size:15px;margin:0 0 12px"><strong>${senderName}</strong> sent you a message about <strong>${dogTitle}</strong>:</p>
            <blockquote style="margin:0 0 20px;padding:12px 16px;background:#fff;border-left:3px solid #D4600A;font-size:14px;line-height:1.5">${preview}</blockquote>
            <a href="${threadUrl}" style="display:inline-block;background:#D4600A;color:#fff;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;padding:12px 28px">View &amp; Reply</a>
          </div>
          <p style="font-size:11px;color:#7C7A6E;padding:12px 24px">You're receiving this because you have a conversation on GunDog Exchange. Replies to this email are not delivered — use the link above.</p>
        </div>`,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Resend failed: ${err.slice(0, 200)}` }, { status: 502 })
  }
  const sent = await res.json()
  return NextResponse.json({ sent: sent.id })
}
