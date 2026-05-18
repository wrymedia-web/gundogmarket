export type TrainingLevel = 'puppy' | 'started' | 'finished' | 'brood'

export interface DogListing {
  id: string
  title: string
  breed: string
  age_months: number
  gender: 'male' | 'female'
  training_level: TrainingLevel
  price: number // in cents
  location_state: string
  location_city: string
  description: string
  health_certs: string[]
  hunt_titles: string[]
  images: string[]
  video_url?: string
  status: 'active' | 'pending' | 'sold' | 'draft'
  featured: boolean
  seller: {
    id: string
    full_name: string
    kennel_name: string
    location_state: string
    rating: number
    review_count: number
    verified: boolean
    breeder_pro: boolean
  }
  created_at: string
}

export const MOCK_DOGS: DogListing[] = [
  {
    id: '1',
    title: 'AKC MH Yellow Lab — OFA Excellent',
    breed: 'Labrador Retriever',
    age_months: 36,
    gender: 'male',
    training_level: 'finished',
    price: 350000,
    location_state: 'MN',
    location_city: 'Bemidji',
    description: 'Duke is a finished yellow Lab with an AKC Master Hunter title. He has been hunting ducks and pheasants for 3 seasons. Force-fetched, steady to shot, handles blinds to 200 yards. OFA Excellent hips, clear CAER eye exam. Will deliver for travel cost.',
    health_certs: ['OFA Hip - Excellent', 'CAER Eye Exam - Clear', 'DNA Panel - Clear'],
    hunt_titles: ['AKC Master Hunter (MH)', 'AKC Senior Hunter (SH)'],
    images: [],
    status: 'active',
    featured: true,
    seller: {
      id: 's1',
      full_name: 'Tom Hendricks',
      kennel_name: 'Iron Ridge Retrievers',
      location_state: 'MN',
      rating: 4.9,
      review_count: 23,
      verified: true,
      breeder_pro: true,
    },
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Started GSP Female — 18 Months',
    breed: 'German Shorthaired Pointer',
    age_months: 18,
    gender: 'female',
    training_level: 'started',
    price: 175000,
    location_state: 'KS',
    location_city: 'Wichita',
    description: 'Stella is an 18-month GSP with solid obedience, will retrieve to hand, backing birds in the field. Ready for her first season with a committed hunter. Sire is NAVHDA UT Prize I dog. Dam is AKC SH.',
    health_certs: ['OFA Hip - Good', 'CAER Eye Exam - Clear'],
    hunt_titles: ['NAVHDA Natural Ability - Prize II'],
    images: [],
    status: 'active',
    featured: false,
    seller: {
      id: 's2',
      full_name: 'Rachel Moore',
      kennel_name: 'Flint Hills GSPs',
      location_state: 'KS',
      rating: 4.7,
      review_count: 11,
      verified: true,
      breeder_pro: false,
    },
    created_at: '2026-05-03T00:00:00Z',
  },
  {
    id: '3',
    title: 'Finished Brittany Spaniel — NSTRA Champion',
    breed: 'Brittany',
    age_months: 48,
    gender: 'male',
    training_level: 'finished',
    price: 450000,
    location_state: 'SD',
    location_city: 'Pierre',
    description: 'Boone is a 4-year NSTRA Champion Brittany. He has won 3 field trials in the past 2 seasons. Hunts pheasant, quail, grouse. Excellent house manners, kennels well, travels well. Selling due to owner health — this is a rare find.',
    health_certs: ['OFA Hip - Good', 'CAER Eye Exam - Clear', 'Cardiac Exam - Normal'],
    hunt_titles: ['NSTRA Champion', 'AKC Junior Hunter (JH)'],
    images: [],
    status: 'active',
    featured: true,
    seller: {
      id: 's3',
      full_name: 'Bill Carson',
      kennel_name: '',
      location_state: 'SD',
      rating: 5.0,
      review_count: 4,
      verified: true,
      breeder_pro: false,
    },
    created_at: '2026-05-05T00:00:00Z',
  },
  {
    id: '4',
    title: 'AKC Vizsla Puppy — Hunt-Bred Litter',
    breed: 'Vizsla',
    age_months: 10,
    gender: 'female',
    training_level: 'puppy',
    price: 120000,
    location_state: 'OH',
    location_city: 'Columbus',
    description: 'Last female from our spring litter — both parents are AKC titled hunting dogs. Pup has had 60 days of intro bird work, is retrieving bumpers enthusiastically, excellent temperament, will be an easy dog to train.',
    health_certs: ['Vet Health Cert - Clear', 'DNA Panel - Clear'],
    hunt_titles: [],
    images: [],
    status: 'active',
    featured: false,
    seller: {
      id: 's4',
      full_name: 'Sarah Kozlowski',
      kennel_name: 'Redwood Run Vizslas',
      location_state: 'OH',
      rating: 4.8,
      review_count: 17,
      verified: true,
      breeder_pro: true,
    },
    created_at: '2026-05-08T00:00:00Z',
  },
  {
    id: '5',
    title: 'HRC Seasoned Chocolate Lab',
    breed: 'Labrador Retriever',
    age_months: 30,
    gender: 'male',
    training_level: 'started',
    price: 220000,
    location_state: 'TX',
    location_city: 'Austin',
    description: 'Buck is an HRC Seasoned titled chocolate Lab, 2.5 years old. Excellent water dog, handles well in flooded timber. Looking for a dedicated waterfowler to take him to the next level. Current owner has 3 dogs and needs to reduce.',
    health_certs: ['OFA Hip - Good', 'CAER Eye Exam - Clear'],
    hunt_titles: ['HRC Seasoned'],
    images: [],
    status: 'active',
    featured: false,
    seller: {
      id: 's5',
      full_name: 'Marcus Webb',
      kennel_name: '',
      location_state: 'TX',
      rating: 4.6,
      review_count: 6,
      verified: false,
      breeder_pro: false,
    },
    created_at: '2026-05-10T00:00:00Z',
  },
  {
    id: '6',
    title: 'English Setter — Finished Upland',
    breed: 'English Setter',
    age_months: 60,
    gender: 'female',
    training_level: 'finished',
    price: 280000,
    location_state: 'PA',
    location_city: 'Pittsburgh',
    description: 'Emma is a 5-year finished English Setter for upland birds. She points, backs, retrieves. Has hunted grouse and woodcock in the PA mountains her whole life. AKC Junior Hunter title. OFA Good hips. A true gentleman\'s gun dog.',
    health_certs: ['OFA Hip - Good', 'CAER Eye Exam - Clear'],
    hunt_titles: ['AKC Junior Hunter (JH)'],
    images: [],
    status: 'active',
    featured: false,
    seller: {
      id: 's6',
      full_name: 'Dave Schultz',
      kennel_name: 'Mountain Ridge Setters',
      location_state: 'PA',
      rating: 4.9,
      review_count: 8,
      verified: true,
      breeder_pro: false,
    },
    created_at: '2026-05-12T00:00:00Z',
  },
  {
    id: '7',
    title: 'NAVHDA UT Prize I — Black Lab Stud',
    breed: 'Labrador Retriever',
    age_months: 42,
    gender: 'male',
    training_level: 'finished',
    price: 500000,
    location_state: 'WI',
    location_city: 'Green Bay',
    description: 'Rex earned NAVHDA Utility Test Prize I at age 3. He is the complete package — water retrieves in all conditions, steady to wing and shot, excellent nose. DNA panel clear, OFA Excellent hips. Available for stud or purchase to approved home.',
    health_certs: ['OFA Hip - Excellent', 'CAER Eye Exam - Clear', 'DNA Panel - Clear', 'Cardiac Exam - Normal'],
    hunt_titles: ['NAVHDA Utility Test - Prize I', 'AKC Master Hunter (MH)'],
    images: [],
    status: 'active',
    featured: true,
    seller: {
      id: 's7',
      full_name: 'Jen Fischer',
      kennel_name: 'Bay Country Labs',
      location_state: 'WI',
      rating: 5.0,
      review_count: 31,
      verified: true,
      breeder_pro: true,
    },
    created_at: '2026-05-14T00:00:00Z',
  },
  {
    id: '8',
    title: 'Started Brood Bitch — GSP / Exceptional Pedigree',
    breed: 'German Shorthaired Pointer',
    age_months: 24,
    gender: 'female',
    training_level: 'brood',
    price: 160000,
    location_state: 'CO',
    location_city: 'Denver',
    description: 'Heidi is a 2-year GSP with hunting experience and outstanding pedigree for breeding. Sire is NAVHDA UT Prize I, dam is dual AKC SH/NAVHDA NA Prize I. OFA Good hips, DNA clear. Current owner is moving and cannot keep dogs.',
    health_certs: ['OFA Hip - Good', 'CAER Eye Exam - Clear', 'DNA Panel - Clear'],
    hunt_titles: ['NAVHDA Natural Ability - Prize I'],
    images: [],
    status: 'active',
    featured: false,
    seller: {
      id: 's8',
      full_name: 'Chris Nguyen',
      kennel_name: '',
      location_state: 'CO',
      rating: 4.5,
      review_count: 2,
      verified: false,
      breeder_pro: false,
    },
    created_at: '2026-05-15T00:00:00Z',
  },
]

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}

export function formatAge(months: number): string {
  if (months < 12) return `${months} mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} yr`
  return `${years} yr ${rem} mo`
}

export const TRAINING_LEVEL_LABELS: Record<TrainingLevel, string> = {
  puppy: 'Puppy',
  started: 'Started',
  finished: 'Finished',
  brood: 'Brood',
}

export const TRAINING_LEVEL_COLORS: Record<TrainingLevel, { bg: string; color: string }> = {
  puppy: { bg: '#EAE4D6', color: '#7C7A6E' },
  started: { bg: '#FEF3C7', color: '#92400E' },
  finished: { bg: '#DCFCE7', color: '#166534' },
  brood: { bg: '#EDE9FE', color: '#5B21B6' },
}

export const ALL_BREEDS = [
  'Labrador Retriever',
  'German Shorthaired Pointer',
  'Brittany',
  'Vizsla',
  'English Setter',
  'Irish Setter',
  'Golden Retriever',
  'Weimaraner',
  'Pointer',
  'Boykin Spaniel',
  'Chesapeake Bay Retriever',
  'Flat-Coated Retriever',
  'German Wirehaired Pointer',
  'Cocker Spaniel',
]

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]
