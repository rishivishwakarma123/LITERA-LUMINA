export const CATEGORIES = ['UPSC', 'JEE', 'NEET', 'GATE', 'NCERT', 'Class 12'] as const
export type Category = (typeof CATEGORIES)[number]

export const CITIES = [
  'Delhi',
  'Kota',
  'Prayagraj',
  'Hyderabad',
  'Pune',
  'Bengaluru',
  'Patna',
  'Jaipur',
] as const

export type Book = {
  id: string
  title: string
  author: string
  category: Category
  originalPrice: number
  sellingPrice: number
  condition: string
  conditionLevel: 'Like New' | 'Good' | 'Fair'
  distanceKm: number
  seller: string
  city: (typeof CITIES)[number]
  quantity?: number
  imageUrl?: string
  forRent?: boolean
}

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'Indian Polity',
    author: 'M. Laxmikanth',
    category: 'UPSC',
    originalPrice: 899,
    sellingPrice: 299,
    condition: 'Like New with minimal notes',
    conditionLevel: 'Like New',
    distanceKm: 1.8,
    seller: 'Aarav S.',
    city: 'Delhi',
    forRent: true,
  },
  {
    id: '2',
    title: 'Concepts of Physics Vol. 1',
    author: 'H.C. Verma',
    category: 'JEE',
    originalPrice: 545,
    sellingPrice: 220,
    condition: 'Good, pencil highlights on key topics',
    conditionLevel: 'Good',
    distanceKm: 0.9,
    seller: 'Ishita R.',
    city: 'Kota',
  },
  {
    id: '3',
    title: 'Objective Biology',
    author: 'Trueman',
    category: 'NEET',
    originalPrice: 1150,
    sellingPrice: 450,
    condition: 'Like New, cover slightly bent',
    conditionLevel: 'Like New',
    distanceKm: 2.4,
    seller: 'Mohit K.',
    city: 'Delhi',
    forRent: true,
  },
  {
    id: '4',
    title: 'Problems in General Physics',
    author: 'I.E. Irodov',
    category: 'JEE',
    originalPrice: 425,
    sellingPrice: 180,
    condition: 'Fair, solved problems marked',
    conditionLevel: 'Fair',
    distanceKm: 3.1,
    seller: 'Neha P.',
    city: 'Kota',
  },
  {
    id: '5',
    title: 'Indian Economy',
    author: 'Ramesh Singh',
    category: 'UPSC',
    originalPrice: 975,
    sellingPrice: 350,
    condition: 'Good, few underlined pages',
    conditionLevel: 'Good',
    distanceKm: 1.2,
    seller: 'Rohan D.',
    city: 'Prayagraj',
  },
  {
    id: '6',
    title: 'Mathematics Textbook Part I',
    author: 'NCERT',
    category: 'NCERT',
    originalPrice: 230,
    sellingPrice: 90,
    condition: 'Like New, no markings',
    conditionLevel: 'Like New',
    distanceKm: 0.6,
    seller: 'Priya M.',
    city: 'Jaipur',
  },
  {
    id: '7',
    title: 'Engineering Mathematics',
    author: 'B.S. Grewal',
    category: 'GATE',
    originalPrice: 795,
    sellingPrice: 320,
    condition: 'Good, spine intact',
    conditionLevel: 'Good',
    distanceKm: 4.2,
    seller: 'Karthik V.',
    city: 'Hyderabad',
    forRent: true,
  },
  {
    id: '8',
    title: 'Physical Chemistry',
    author: 'O.P. Tandon',
    category: 'NEET',
    originalPrice: 860,
    sellingPrice: 310,
    condition: 'Good with short margin notes',
    conditionLevel: 'Good',
    distanceKm: 2.0,
    seller: 'Sana A.',
    city: 'Patna',
  },
  {
    id: '9',
    title: 'Physics Part I & II',
    author: 'NCERT',
    category: 'Class 12',
    originalPrice: 380,
    sellingPrice: 150,
    condition: 'Like New with minimal notes',
    conditionLevel: 'Like New',
    distanceKm: 1.5,
    seller: 'Dev T.',
    city: 'Pune',
  },
]
