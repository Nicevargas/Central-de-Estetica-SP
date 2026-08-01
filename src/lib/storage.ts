import { Treatment, Testimonial, Promotion, BlogPost, BookingRequest, ContactInfo } from '../types';
import { TREATMENTS, TESTIMONIALS, INITIAL_PROMOTIONS, INITIAL_BLOG_POSTS, DEFAULT_CONTACT_INFO } from '../data';
import {
  isSupabaseConfigured,
  fetchTreatmentsFromSupabase,
  createTreatmentInSupabase,
  saveTreatmentToSupabase,
  deleteTreatmentInSupabase,
  fetchPromotionsFromSupabase,
  createPromotionInSupabase,
  deletePromotionInSupabase,
  fetchTestimonialsFromSupabase,
  createTestimonialInSupabase,
  deleteTestimonialInSupabase,
  fetchBlogPostsFromSupabase,
  createBlogPostInSupabase,
  deleteBlogPostInSupabase,
  fetchBookingsFromSupabase,
  createBookingInSupabase,
  deleteBookingInSupabase,
  fetchContactInfoFromSupabase,
  saveContactInfoToSupabase,
} from './supabase';

const STORAGE_KEYS = {
  TREATMENTS: 'estetica_treatments_v1',
  PROMOTIONS: 'estetica_promotions_v1',
  TESTIMONIALS: 'estetica_testimonials_v1',
  BLOG_POSTS: 'estetica_blog_posts_v1',
  BOOKINGS: 'estetica_bookings_v1',
  CONTACT_INFO: 'estetica_contact_info_v1',
};

// Safe localStorage access
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage`, err);
  }
}

// =============================
// Treatments
// =============================
export function getStoredTreatments(): Treatment[] {
  return loadFromStorage<Treatment[]>(STORAGE_KEYS.TREATMENTS, TREATMENTS);
}

export function saveStoredTreatments(treatments: Treatment[]): void {
  saveToStorage(STORAGE_KEYS.TREATMENTS, treatments);
  if (isSupabaseConfigured()) {
    treatments.forEach((t) => {
      saveTreatmentToSupabase(t).catch((err) =>
        console.warn('Notice: Sync treatment to Supabase failed:', err)
      );
    });
  }
}

export async function syncTreatments(): Promise<Treatment[]> {
  if (isSupabaseConfigured()) {
    const remote = await fetchTreatmentsFromSupabase();
    if (remote && remote.length > 0) {
      saveStoredTreatments(remote);
      return remote;
    }
  }
  return getStoredTreatments();
}

export async function addTreatment(treatment: Treatment): Promise<void> {
  if (isSupabaseConfigured()) {
    await createTreatmentInSupabase(treatment);
  }
}

export async function removeTreatment(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteTreatmentInSupabase(id);
  }
}

// =============================
// Promotions
// =============================
export function getStoredPromotions(): Promotion[] {
  return loadFromStorage<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
}

export function saveStoredPromotions(promotions: Promotion[]): void {
  saveToStorage(STORAGE_KEYS.PROMOTIONS, promotions);
}

export async function syncPromotions(): Promise<Promotion[]> {
  if (isSupabaseConfigured()) {
    const remote = await fetchPromotionsFromSupabase();
    if (remote && remote.length > 0) {
      saveStoredPromotions(remote);
      return remote;
    }
  }
  return getStoredPromotions();
}

export async function addPromotion(promo: Promotion): Promise<void> {
  if (isSupabaseConfigured()) {
    await createPromotionInSupabase(promo);
  }
}

export async function removePromotion(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deletePromotionInSupabase(id);
  }
}

// =============================
// Testimonials
// =============================
export function getStoredTestimonials(): Testimonial[] {
  return loadFromStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, TESTIMONIALS);
}

export function saveStoredTestimonials(testimonials: Testimonial[]): void {
  saveToStorage(STORAGE_KEYS.TESTIMONIALS, testimonials);
}

export async function syncTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured()) {
    const remote = await fetchTestimonialsFromSupabase();
    if (remote && remote.length > 0) {
      saveStoredTestimonials(remote);
      return remote;
    }
  }
  return getStoredTestimonials();
}

export async function addTestimonial(testimonial: Testimonial): Promise<void> {
  if (isSupabaseConfigured()) {
    await createTestimonialInSupabase(testimonial);
  }
}

export async function removeTestimonial(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteTestimonialInSupabase(id);
  }
}

// =============================
// Blog Posts
// =============================
export function getStoredBlogPosts(): BlogPost[] {
  return loadFromStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, INITIAL_BLOG_POSTS);
}

export function saveStoredBlogPosts(posts: BlogPost[]): void {
  saveToStorage(STORAGE_KEYS.BLOG_POSTS, posts);
}

export async function syncBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    const remote = await fetchBlogPostsFromSupabase();
    if (remote && remote.length > 0) {
      saveStoredBlogPosts(remote);
      return remote;
    }
  }
  return getStoredBlogPosts();
}

export async function addBlogPost(post: BlogPost): Promise<void> {
  if (isSupabaseConfigured()) {
    await createBlogPostInSupabase(post);
  }
}

export async function removeBlogPost(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteBlogPostInSupabase(id);
  }
}

// =============================
// Bookings
// =============================
export function getStoredBookings(): BookingRequest[] {
  return loadFromStorage<BookingRequest[]>(STORAGE_KEYS.BOOKINGS, []);
}

export function saveStoredBookings(bookings: BookingRequest[]): void {
  saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
}

export async function syncBookings(): Promise<BookingRequest[]> {
  if (isSupabaseConfigured()) {
    const remote = await fetchBookingsFromSupabase();
    if (remote) {
      saveStoredBookings(remote);
      return remote;
    }
  }
  return getStoredBookings();
}

export async function addBooking(booking: BookingRequest): Promise<void> {
  if (isSupabaseConfigured()) {
    await createBookingInSupabase(booking);
  }
}

export async function removeBooking(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteBookingInSupabase(id);
  }
}

// =============================
// Contact Info
// =============================
export function getStoredContactInfo(): ContactInfo {
  const loaded = loadFromStorage<ContactInfo>(STORAGE_KEYS.CONTACT_INFO, DEFAULT_CONTACT_INFO);
  if (
    !loaded ||
    loaded.whatsappNumber === '551130512433' ||
    loaded.phonePrimary?.includes('3051-2433') ||
    loaded.phonePrimary?.includes('3052') ||
    loaded.phonePrimary?.includes('3052-1400')
  ) {
    saveStoredContactInfo(DEFAULT_CONTACT_INFO);
    return DEFAULT_CONTACT_INFO;
  }
  return loaded;
}

export function saveStoredContactInfo(info: ContactInfo): void {
  saveToStorage(STORAGE_KEYS.CONTACT_INFO, info);
}

export async function syncContactInfo(): Promise<ContactInfo> {
  if (isSupabaseConfigured()) {
    const remote = await fetchContactInfoFromSupabase();
    if (remote) {
      if (
        remote.whatsappNumber === '551130512433' ||
        remote.phonePrimary?.includes('3051-2433') ||
        remote.phonePrimary?.includes('3052') ||
        remote.phonePrimary?.includes('3052-1400')
      ) {
        await saveContactInfoToSupabase(DEFAULT_CONTACT_INFO);
        saveStoredContactInfo(DEFAULT_CONTACT_INFO);
        return DEFAULT_CONTACT_INFO;
      }
      saveStoredContactInfo(remote);
      return remote;
    }
  }
  return getStoredContactInfo();
}

export async function addOrUpdateContactInfo(info: ContactInfo): Promise<void> {
  saveStoredContactInfo(info);
  if (isSupabaseConfigured()) {
    await saveContactInfoToSupabase(info);
  }
}

