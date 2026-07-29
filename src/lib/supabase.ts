import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Treatment, Promotion, Testimonial, BlogPost, BookingRequest } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 1. TREATMENTS CRUD
// ==========================================

export async function fetchTreatmentsFromSupabase(): Promise<Treatment[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching treatments from Supabase:', error);
    return null;
  }
  return data as Treatment[];
}

export async function createTreatmentInSupabase(treatment: Treatment): Promise<Treatment | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('treatments')
    .insert([treatment])
    .select()
    .single();
  if (error) {
    console.error('Error creating treatment in Supabase:', error);
    return null;
  }
  return data as Treatment;
}

export async function updateTreatmentInSupabase(id: string, updates: Partial<Treatment>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('treatments')
    .update(updates)
    .eq('id', id);
  if (error) {
    console.error('Error updating treatment in Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteTreatmentInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting treatment from Supabase:', error);
    return false;
  }
  return true;
}

// ==========================================
// 2. PROMOTIONS CRUD
// ==========================================

export async function fetchPromotionsFromSupabase(): Promise<Promotion[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('promotions')
    .select('*');
  if (error) {
    console.error('Error fetching promotions from Supabase:', error);
    return null;
  }
  
  // Convert DB snake_case to TS camelCase
  return data.map((row) => ({
    id: row.id,
    badge: row.badge,
    title: row.title,
    subtitle: row.subtitle,
    discount: row.discount,
    originalPrice: row.original_price,
    promoPrice: row.promo_price,
    couponCode: row.coupon_code,
    expiresInDays: row.expires_in_days,
    treatmentId: row.treatment_id,
  }));
}

export async function createPromotionInSupabase(promo: Promotion): Promise<Promotion | null> {
  if (!supabase) return null;
  const dbRow = {
    id: promo.id,
    badge: promo.badge,
    title: promo.title,
    subtitle: promo.subtitle,
    discount: promo.discount,
    original_price: promo.originalPrice,
    promo_price: promo.promoPrice,
    coupon_code: promo.couponCode,
    expires_in_days: promo.expiresInDays,
    treatment_id: promo.treatmentId,
  };
  
  const { data, error } = await supabase
    .from('promotions')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating promotion in Supabase:', error);
    return null;
  }

  return {
    id: data.id,
    badge: data.badge,
    title: data.title,
    subtitle: data.subtitle,
    discount: data.discount,
    originalPrice: data.original_price,
    promoPrice: data.promo_price,
    couponCode: data.coupon_code,
    expiresInDays: data.expires_in_days,
    treatmentId: data.treatment_id,
  };
}

export async function updatePromotionInSupabase(id: string, updates: Partial<Promotion>): Promise<boolean> {
  if (!supabase) return false;
  const dbRow: Record<string, unknown> = {};
  if (updates.badge !== undefined) dbRow.badge = updates.badge;
  if (updates.title !== undefined) dbRow.title = updates.title;
  if (updates.subtitle !== undefined) dbRow.subtitle = updates.subtitle;
  if (updates.discount !== undefined) dbRow.discount = updates.discount;
  if (updates.originalPrice !== undefined) dbRow.original_price = updates.originalPrice;
  if (updates.promoPrice !== undefined) dbRow.promo_price = updates.promoPrice;
  if (updates.couponCode !== undefined) dbRow.coupon_code = updates.couponCode;
  if (updates.expiresInDays !== undefined) dbRow.expires_in_days = updates.expiresInDays;
  if (updates.treatmentId !== undefined) dbRow.treatment_id = updates.treatmentId;

  const { error } = await supabase
    .from('promotions')
    .update(dbRow)
    .eq('id', id);

  if (error) {
    console.error('Error updating promotion in Supabase:', error);
    return false;
  }
  return true;
}

export async function deletePromotionInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting promotion from Supabase:', error);
    return false;
  }
  return true;
}

// ==========================================
// 3. TESTIMONIALS CRUD
// ==========================================

export async function fetchTestimonialsFromSupabase(): Promise<Testimonial[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('testimonials')
    .select('*');
  if (error) {
    console.error('Error fetching testimonials from Supabase:', error);
    return null;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    text: row.text,
    stars: row.stars,
    avatarBg: row.avatar_bg,
  }));
}

export async function createTestimonialInSupabase(t: Testimonial): Promise<Testimonial | null> {
  if (!supabase) return null;
  const dbRow = {
    id: t.id,
    name: t.name,
    role: t.role,
    text: t.text,
    stars: t.stars,
    avatar_bg: t.avatarBg,
  };
  const { data, error } = await supabase
    .from('testimonials')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating testimonial in Supabase:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    text: data.text,
    stars: data.stars,
    avatarBg: data.avatar_bg,
  };
}

export async function updateTestimonialInSupabase(id: string, updates: Partial<Testimonial>): Promise<boolean> {
  if (!supabase) return false;
  const dbRow: Record<string, unknown> = {};
  if (updates.name !== undefined) dbRow.name = updates.name;
  if (updates.role !== undefined) dbRow.role = updates.role;
  if (updates.text !== undefined) dbRow.text = updates.text;
  if (updates.stars !== undefined) dbRow.stars = updates.stars;
  if (updates.avatarBg !== undefined) dbRow.avatar_bg = updates.avatarBg;

  const { error } = await supabase
    .from('testimonials')
    .update(dbRow)
    .eq('id', id);

  if (error) {
    console.error('Error updating testimonial in Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteTestimonialInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting testimonial from Supabase:', error);
    return false;
  }
  return true;
}

// ==========================================
// 4. BLOG POSTS CRUD
// ==========================================

export async function fetchBlogPostsFromSupabase(): Promise<BlogPost[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching blog posts from Supabase:', error);
    return null;
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    author: row.author,
    date: row.date,
    readTime: row.read_time,
    featured: row.featured,
    image: row.image,
    excerpt: row.excerpt,
    content: row.content,
  }));
}

export async function createBlogPostInSupabase(post: BlogPost): Promise<BlogPost | null> {
  if (!supabase) return null;
  const dbRow = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    author: post.author,
    date: post.date,
    read_time: post.readTime,
    featured: post.featured,
    image: post.image,
    excerpt: post.excerpt,
    content: post.content,
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post in Supabase:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    category: data.category,
    author: data.author,
    date: data.date,
    readTime: data.read_time,
    featured: data.featured,
    image: data.image,
    excerpt: data.excerpt,
    content: data.content,
  };
}

export async function updateBlogPostInSupabase(id: string, updates: Partial<BlogPost>): Promise<boolean> {
  if (!supabase) return false;
  const dbRow: Record<string, unknown> = {};
  if (updates.title !== undefined) dbRow.title = updates.title;
  if (updates.slug !== undefined) dbRow.slug = updates.slug;
  if (updates.category !== undefined) dbRow.category = updates.category;
  if (updates.author !== undefined) dbRow.author = updates.author;
  if (updates.date !== undefined) dbRow.date = updates.date;
  if (updates.readTime !== undefined) dbRow.read_time = updates.readTime;
  if (updates.featured !== undefined) dbRow.featured = updates.featured;
  if (updates.image !== undefined) dbRow.image = updates.image;
  if (updates.excerpt !== undefined) dbRow.excerpt = updates.excerpt;
  if (updates.content !== undefined) dbRow.content = updates.content;

  const { error } = await supabase
    .from('blog_posts')
    .update(dbRow)
    .eq('id', id);

  if (error) {
    console.error('Error updating blog post in Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteBlogPostInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting blog post from Supabase:', error);
    return false;
  }
  return true;
}

// ==========================================
// 5. BOOKINGS CRUD
// ==========================================

export async function fetchBookingsFromSupabase(): Promise<BookingRequest[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching bookings from Supabase:', error);
    return null;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    treatmentId: row.treatment_id || '',
    date: row.date,
    time: row.time,
    notes: row.notes || '',
    status: row.status === 'confirmed' ? 'confirmed' : 'pending',
  }));
}

export async function createBookingInSupabase(booking: BookingRequest): Promise<BookingRequest | null> {
  if (!supabase) return null;
  const dbRow = {
    id: booking.id,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    treatment_id: booking.treatmentId || null,
    date: booking.date,
    time: booking.time,
    notes: booking.notes || '',
    status: booking.status || 'pending',
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([dbRow])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking in Supabase:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    treatmentId: data.treatment_id || '',
    date: data.date,
    time: data.time,
    notes: data.notes,
    status: data.status === 'confirmed' ? 'confirmed' : 'pending',
  };
}

export async function updateBookingStatusInSupabase(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating booking status in Supabase:', error);
    return false;
  }
  return true;
}

export async function deleteBookingInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting booking from Supabase:', error);
    return false;
  }
  return true;
}
