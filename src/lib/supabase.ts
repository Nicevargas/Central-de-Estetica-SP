import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Treatment, Promotion, Testimonial, BlogPost, BookingRequest, ContactInfo } from '../types';

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
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('name');
    if (error) {
      console.warn('Notice: Error fetching treatments from Supabase:', error.message);
      return null;
    }
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      popular: row.popular ?? false,
      highlight: row.highlight ?? false,
      duration: row.duration,
      price: row.price,
      image: row.image,
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      beforeAfterImages: row.before_after_images || row.beforeAfterImages || [],
      videoUrl: row.video_url || row.videoUrl || '',
      technicalSpecs: row.technical_specs || row.technicalSpecs || {},
      postCareTips: Array.isArray(row.post_care_tips) ? row.post_care_tips : (Array.isArray(row.postCareTips) ? row.postCareTips : []),
      specialist: row.specialist || null,
    }));
  } catch (err) {
    console.warn('Notice: Exception fetching treatments from Supabase:', err);
    return null;
  }
}

export async function createTreatmentInSupabase(treatment: Treatment): Promise<Treatment | null> {
  if (!supabase) return null;
  try {
    const dbRow = {
      id: treatment.id,
      name: treatment.name,
      description: treatment.description,
      category: treatment.category,
      popular: treatment.popular || false,
      highlight: treatment.highlight || false,
      duration: treatment.duration || '',
      price: treatment.price || '',
      image: treatment.image || '',
      benefits: treatment.benefits || [],
      before_after_images: treatment.beforeAfterImages || [],
      video_url: treatment.videoUrl || '',
      technical_specs: treatment.technicalSpecs || {},
      post_care_tips: treatment.postCareTips || [],
      specialist: treatment.specialist || null,
    };

    const { data, error } = await supabase
      .from('treatments')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.warn('Notice: Error creating treatment in Supabase:', error.message);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      popular: data.popular,
      highlight: data.highlight,
      duration: data.duration,
      price: data.price,
      image: data.image,
      benefits: data.benefits,
      beforeAfterImages: data.before_after_images || [],
      videoUrl: data.video_url || '',
      technicalSpecs: data.technical_specs || {},
      postCareTips: data.post_care_tips || [],
      specialist: data.specialist || null,
    };
  } catch (err) {
    console.warn('Notice: Exception creating treatment in Supabase:', err);
    return null;
  }
}

export async function updateTreatmentInSupabase(id: string, updates: Partial<Treatment>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow: Record<string, unknown> = {};
    if (updates.name !== undefined) dbRow.name = updates.name;
    if (updates.description !== undefined) dbRow.description = updates.description;
    if (updates.category !== undefined) dbRow.category = updates.category;
    if (updates.popular !== undefined) dbRow.popular = updates.popular;
    if (updates.highlight !== undefined) dbRow.highlight = updates.highlight;
    if (updates.duration !== undefined) dbRow.duration = updates.duration;
    if (updates.price !== undefined) dbRow.price = updates.price;
    if (updates.image !== undefined) dbRow.image = updates.image;
    if (updates.benefits !== undefined) dbRow.benefits = updates.benefits;
    if (updates.beforeAfterImages !== undefined) dbRow.before_after_images = updates.beforeAfterImages;
    if (updates.videoUrl !== undefined) dbRow.video_url = updates.videoUrl;
    if (updates.technicalSpecs !== undefined) dbRow.technical_specs = updates.technicalSpecs;
    if (updates.postCareTips !== undefined) dbRow.post_care_tips = updates.postCareTips;
    if (updates.specialist !== undefined) dbRow.specialist = updates.specialist;

    const { error } = await supabase
      .from('treatments')
      .update(dbRow)
      .eq('id', id);

    if (error) {
      console.warn('Notice: Error updating treatment in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception updating treatment in Supabase:', err);
    return false;
  }
}

export async function saveTreatmentToSupabase(treatment: Treatment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow = {
      id: treatment.id,
      name: treatment.name,
      description: treatment.description,
      category: treatment.category,
      popular: treatment.popular || false,
      highlight: treatment.highlight || false,
      duration: treatment.duration || '',
      price: treatment.price || '',
      image: treatment.image || '',
      benefits: treatment.benefits || [],
      before_after_images: treatment.beforeAfterImages || [],
      video_url: treatment.videoUrl || '',
      technical_specs: treatment.technicalSpecs || {},
      post_care_tips: treatment.postCareTips || [],
      specialist: treatment.specialist || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('treatments')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Notice: Error saving/upserting treatment in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving treatment to Supabase:', err);
    return false;
  }
}

export async function deleteTreatmentInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Notice: Error deleting treatment from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception deleting treatment from Supabase:', err);
    return false;
  }
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
    originalPrice: row.original_price || row.originalPrice,
    promoPrice: row.promo_price || row.promoPrice,
    couponCode: row.coupon_code || row.couponCode,
    expiresInDays: row.expires_in_days || row.expiresInDays,
    treatmentId: row.treatment_id || row.treatmentId,
    image: row.image || undefined,
    active: row.active ?? true,
  }));
}

export async function savePromotionToSupabase(promo: Promotion): Promise<boolean> {
  if (!supabase) return false;
  try {
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
      treatment_id: promo.treatmentId || null,
      image: promo.image || null,
      active: promo.active !== false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('promotions')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Notice: Error saving promotion to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving promotion to Supabase:', err);
    return false;
  }
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
    image: promo.image || null,
    active: promo.active !== false,
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
    image: data.image || undefined,
    active: data.active ?? true,
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

// ==========================================
// 6. CONTACT INFO / SITE SETTINGS CRUD
// ==========================================

export async function fetchContactInfoFromSupabase(): Promise<ContactInfo | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.warn('Notice: site_settings table not available or uninitialized in Supabase, using local storage:', error.message);
      }
      return null;
    }

    return {
      phonePrimary: data.phone_primary,
      whatsappNumber: data.whatsapp_number,
      email: data.email,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      cep: data.cep,
      instagramUrl: data.instagram_url,
      facebookUrl: data.facebook_url,
    };
  } catch (err) {
    console.warn('Notice: Exception fetching site_settings from Supabase:', err);
    return null;
  }
}

export async function saveContactInfoToSupabase(info: ContactInfo): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow = {
      id: 'default',
      phone_primary: info.phonePrimary,
      whatsapp_number: info.whatsappNumber,
      email: info.email,
      address_line1: info.addressLine1,
      address_line2: info.addressLine2,
      cep: info.cep,
      instagram_url: info.instagramUrl,
      facebook_url: info.facebookUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert(dbRow, { onConflict: 'id' });

    if (error) {
      console.warn('Notice: Could not save site_settings to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving site_settings to Supabase:', err);
    return false;
  }
}
