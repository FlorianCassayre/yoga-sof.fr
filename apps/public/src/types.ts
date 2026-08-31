export type YogaCategory = 'adulte' | 'enfant' | 'parent-enfant' | 'particulier';

export interface YogaCourse {
  id: string;
  title: string;
  subtitle: string;
  category: YogaCategory;
  ageGroup?: string;
  groupSize: string;
  duration: string;
  locationName: string;
  locationAddress: string;
  description: string;
  benefits: string[];
  forWhom: string;
  image: string;
  accentColor: string;
  trialPrice: string;
  unitPrice: string;
}

export interface ScheduleSlot {
  id: string;
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  time: string;
  courseTitle: string;
  category: YogaCategory;
  level: string;
  location: string;
  locationShort: string;
  maxSeats: number;
  availableSeats: number;
  instructor: string;
  tag: string;
  priceTrial: number;
}

export interface PricingTier {
  id: string;
  name: string;
  category: YogaCategory | 'pass';
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  note?: string;
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  badge: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'cours' | 'tarifs' | 'lieux';
}

export interface BookingData {
  courseId?: string;
  slotId?: string;
  courseTitle: string;
  dateOrDay: string;
  timeSlot: string;
  location: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  isFirstTrial: boolean;
  notes: string;
}
