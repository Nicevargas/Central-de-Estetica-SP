import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Treatment, Promotion, Testimonial, BlogPost, BookingRequest, ContactInfo } from '../types';
import { sanitizeTreatmentObject, formatGoogleDriveImageUrl, formatVideoEmbedUrl, parseBeforeAfterImages } from './treatmentUtils';

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

    return data.map((row: any) => {
      const rawTreatment: Treatment = {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        popular: row.popular ?? false,
        highlight: row.highlight ?? false,
        duration: row.duration,
        price: row.price,
        image: formatGoogleDriveImageUrl(row.image) || row.image || '',
        benefits: Array.isArray(row.benefits) ? row.benefits : [],
        beforeAfterImages: parseBeforeAfterImages(row.before_after_images || row.beforeAfterImages || row.before_image || row.after_image),
        videoUrl: formatVideoEmbedUrl(row.video_url || row.videoUrl || ''),
        technicalSpecs: row.technical_specs || row.technicalSpecs || {},
        postCareTips: Array.isArray(row.post_care_tips) ? row.post_care_tips : (Array.isArray(row.postCareTips) ? row.postCareTips : []),
        specialist: row.specialist || null,
      };
      return sanitizeTreatmentObject(rawTreatment);
    });
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
    const dbRow: Record<string, any> = {
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

    let { error } = await supabase
      .from('treatments')
      .upsert(dbRow, { onConflict: 'id' });

    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('treatments')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

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
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      // If table doesn't have created_at, fallback to select all without order
      const fallback = await supabase.from('promotions').select('*');
      if (fallback.error) {
        console.warn('Notice: Error fetching promotions from Supabase:', fallback.error.message);
        return null;
      }
      if (!fallback.data) return [];
      return fallback.data.map((row: any) => ({
        id: row.id,
        badge: row.badge || 'PROMOÇÃO ESPECIAL',
        title: row.title || '',
        subtitle: row.subtitle || '',
        discount: row.discount || '',
        originalPrice: row.original_price || row.originalPrice || '',
        promoPrice: row.promo_price || row.promoPrice || '',
        couponCode: row.coupon_code || row.couponCode || '',
        expiresInDays: Number(row.expires_in_days || row.expiresInDays) || 7,
        treatmentId: row.treatment_id || row.treatmentId || '',
        image: row.image || undefined,
        active: row.active ?? true,
      }));
    }
    
    if (!data) return [];

    // Convert DB snake_case to TS camelCase
    return data.map((row: any) => ({
      id: row.id,
      badge: row.badge || 'PROMOÇÃO ESPECIAL',
      title: row.title || '',
      subtitle: row.subtitle || '',
      discount: row.discount || '',
      originalPrice: row.original_price || row.originalPrice || '',
      promoPrice: row.promo_price || row.promoPrice || '',
      couponCode: row.coupon_code || row.couponCode || '',
      expiresInDays: Number(row.expires_in_days || row.expiresInDays) || 7,
      treatmentId: row.treatment_id || row.treatmentId || '',
      image: row.image || undefined,
      active: row.active ?? true,
    }));
  } catch (err) {
    console.warn('Notice: Exception fetching promotions from Supabase:', err);
    return null;
  }
}

export async function savePromotionToSupabase(promo: Promotion): Promise<boolean> {
  if (!supabase) return false;
  try {
    const cleanTreatmentId = promo.treatmentId && promo.treatmentId.trim() !== '' ? promo.treatmentId.trim() : null;

    const dbRow: Record<string, any> = {
      id: promo.id,
      badge: promo.badge || 'PROMOÇÃO ESPECIAL',
      title: promo.title || '',
      subtitle: promo.subtitle || '',
      discount: promo.discount || '',
      original_price: promo.originalPrice || '',
      promo_price: promo.promoPrice || '',
      coupon_code: promo.couponCode || '',
      expires_in_days: Number(promo.expiresInDays) || 7,
      treatment_id: cleanTreatmentId,
      image: promo.image || null,
      active: promo.active !== false,
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase
      .from('promotions')
      .upsert(dbRow, { onConflict: 'id' });

    // Fallback 1: If updated_at does not exist in the table
    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('promotions')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

    // Fallback 2: If image column does not exist in the table
    if (error && error.message?.toLowerCase().includes('image')) {
      delete dbRow.image;
      const retry = await supabase
        .from('promotions')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

    // Fallback 3: If foreign key on treatment_id failed
    if (error && (error.message?.toLowerCase().includes('treatment_id') || error.message?.toLowerCase().includes('foreign key'))) {
      dbRow.treatment_id = null;
      const retry = await supabase
        .from('promotions')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

    // Fallback 4: If both image and updated_at don't exist
    if (error && (error.message?.toLowerCase().includes('image') || error.message?.toLowerCase().includes('updated_at'))) {
      delete dbRow.image;
      delete dbRow.updated_at;
      const retry = await supabase
        .from('promotions')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

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
  const success = await savePromotionToSupabase(promo);
  if (success) {
    return promo;
  }
  return null;
}

export async function updatePromotionInSupabase(id: string, updates: Partial<Promotion>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const existing = await fetchPromotionsFromSupabase();
    const current = existing?.find((p) => p.id === id);
    if (!current) return false;
    const merged: Promotion = { ...current, ...updates, id };
    return await savePromotionToSupabase(merged);
  } catch (err) {
    console.warn('Notice: Error updating promotion in Supabase:', err);
    return false;
  }
}

export async function deletePromotionInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Notice: Error deleting promotion from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception deleting promotion from Supabase:', err);
    return false;
  }
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

export async function saveTestimonialToSupabase(t: Testimonial): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow: Record<string, any> = {
      id: t.id,
      name: t.name,
      role: t.role,
      text: t.text,
      stars: t.stars,
      avatar_bg: t.avatarBg,
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabase
      .from('testimonials')
      .upsert(dbRow, { onConflict: 'id' });
    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('testimonials')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }
    if (error) {
      console.warn('Notice: Error saving testimonial to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving testimonial to Supabase:', err);
    return false;
  }
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

export async function saveBlogPostToSupabase(post: BlogPost): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow: Record<string, any> = {
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
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabase
      .from('blog_posts')
      .upsert(dbRow, { onConflict: 'id' });
    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('blog_posts')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }
    if (error) {
      console.warn('Notice: Error saving blog post to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving blog post to Supabase:', err);
    return false;
  }
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

export async function saveBookingToSupabase(booking: BookingRequest): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbRow: Record<string, any> = {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      treatment_id: booking.treatmentId || null,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || '',
      status: booking.status || 'pending',
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabase
      .from('bookings')
      .upsert(dbRow, { onConflict: 'id' });
    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('bookings')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }
    if (error) {
      console.warn('Notice: Error saving booking to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Notice: Exception saving booking to Supabase:', err);
    return false;
  }
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
    const dbRow: Record<string, any> = {
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

    let { error } = await supabase
      .from('site_settings')
      .upsert(dbRow, { onConflict: 'id' });

    if (error && error.message?.toLowerCase().includes('updated_at')) {
      delete dbRow.updated_at;
      const retry = await supabase
        .from('site_settings')
        .upsert(dbRow, { onConflict: 'id' });
      error = retry.error;
    }

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

// ==========================================
// 7. DIAGNOSTICS & SQL SCRIPT EXPORT
// ==========================================

export interface TableDiagnosticResult {
  table: string;
  label: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export async function testSupabaseDatabaseTables(): Promise<TableDiagnosticResult[]> {
  if (!supabase) {
    return [
      {
        table: 'all',
        label: 'Conexão Supabase',
        status: 'error',
        message: 'Supabase não configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      },
    ];
  }

  const results: TableDiagnosticResult[] = [];

  // 1. Promotions
  try {
    const { data, error } = await supabase.from('promotions').select('id, title, badge, active').limit(3);
    if (error) {
      results.push({
        table: 'promotions',
        label: 'Banners Promocionais (promotions)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}. Execute o script SQL no Supabase.`,
      });
    } else {
      results.push({
        table: 'promotions',
        label: 'Banners Promocionais (promotions)',
        status: 'ok',
        message: `Tabela acessível. ${data?.length || 0} registros encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'promotions',
      label: 'Banners Promocionais (promotions)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  // 2. Treatments
  try {
    const { data, error } = await supabase.from('treatments').select('id, name').limit(3);
    if (error) {
      results.push({
        table: 'treatments',
        label: 'Tratamentos e Serviços (treatments)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}.`,
      });
    } else {
      results.push({
        table: 'treatments',
        label: 'Tratamentos e Serviços (treatments)',
        status: 'ok',
        message: `Tabela acessível. ${data?.length || 0} registros encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'treatments',
      label: 'Tratamentos e Serviços (treatments)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  // 3. Testimonials
  try {
    const { data, error } = await supabase.from('testimonials').select('id, name').limit(3);
    if (error) {
      results.push({
        table: 'testimonials',
        label: 'Depoimentos (testimonials)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}.`,
      });
    } else {
      results.push({
        table: 'testimonials',
        label: 'Depoimentos (testimonials)',
        status: 'ok',
        message: `Tabela acessível. ${data?.length || 0} registros encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'testimonials',
      label: 'Depoimentos (testimonials)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  // 4. Blog Posts
  try {
    const { data, error } = await supabase.from('blog_posts').select('id, title').limit(3);
    if (error) {
      results.push({
        table: 'blog_posts',
        label: 'Artigos do Blog (blog_posts)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}.`,
      });
    } else {
      results.push({
        table: 'blog_posts',
        label: 'Artigos do Blog (blog_posts)',
        status: 'ok',
        message: `Tabela acessível. ${data?.length || 0} registros encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'blog_posts',
      label: 'Artigos do Blog (blog_posts)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  // 5. Bookings
  try {
    const { data, error } = await supabase.from('bookings').select('id, name').limit(3);
    if (error) {
      results.push({
        table: 'bookings',
        label: 'Agendamentos (bookings)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}.`,
      });
    } else {
      results.push({
        table: 'bookings',
        label: 'Agendamentos (bookings)',
        status: 'ok',
        message: `Tabela acessível. ${data?.length || 0} registros encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'bookings',
      label: 'Agendamentos (bookings)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  // 6. Site Settings
  try {
    const { data, error } = await supabase.from('site_settings').select('id, phone_primary').limit(1);
    if (error) {
      results.push({
        table: 'site_settings',
        label: 'Informações de Contato (site_settings)',
        status: 'error',
        message: `Falha ao consultar: ${error.message}.`,
      });
    } else {
      results.push({
        table: 'site_settings',
        label: 'Informações de Contato (site_settings)',
        status: 'ok',
        message: `Tabela acessível (${data?.length ? 'configurações salvas' : 'vazia, pronta para salvar'}).`,
      });
    }
  } catch (err: any) {
    results.push({
      table: 'site_settings',
      label: 'Informações de Contato (site_settings)',
      status: 'error',
      message: `Erro: ${err?.message || err}`,
    });
  }

  return results;
}

export const SUPABASE_FULL_MIGRATION_SQL = `-- ==============================================================================
-- MIGRAÇÃO COMPLETA: CENTRAL DA ESTÉTICA - BANCO DE DADOS SUPABASE
-- Execute este script no SQL Editor do Supabase (https://app.supabase.com)
-- Cria e atualiza todas as tabelas, colunas de banners/imagens e permissões RLS.
-- ==============================================================================

-- 1. Função para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Tabela de Tratamentos / Serviços
CREATE TABLE IF NOT EXISTS public.treatments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    highlight BOOLEAN DEFAULT FALSE,
    duration TEXT,
    price TEXT,
    image TEXT,
    benefits TEXT[] DEFAULT '{}'::text[],
    before_after_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    technical_specs JSONB DEFAULT '{}'::jsonb,
    post_care_tips TEXT[] DEFAULT '{}'::text[],
    specialist JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT FALSE;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS highlight BOOLEAN DEFAULT FALSE;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS before_after_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS post_care_tips TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS specialist JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.treatments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Tabela de Promoções / Banners
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    badge TEXT DEFAULT 'PROMOÇÃO ESPECIAL',
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    discount TEXT DEFAULT '',
    original_price TEXT DEFAULT '',
    promo_price TEXT DEFAULT '',
    coupon_code TEXT DEFAULT '',
    expires_in_days INTEGER DEFAULT 7,
    treatment_id TEXT,
    image TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'PROMOÇÃO ESPECIAL';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS discount TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS original_price TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS promo_price TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT '';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS expires_in_days INTEGER DEFAULT 7;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS treatment_id TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.promotions ALTER COLUMN badge DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN subtitle DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN discount DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN original_price DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN promo_price DROP NOT NULL;
ALTER TABLE public.promotions ALTER COLUMN coupon_code DROP NOT NULL;

DROP TRIGGER IF EXISTS update_promotions_updated_at ON public.promotions;
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Tabela de Depoimentos
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    stars INTEGER NOT NULL DEFAULT 5,
    avatar_bg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar_bg TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Tabela de Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Tabela de Agendamentos (Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    treatment_id TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Tabela de Configurações do Site / Contato
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    phone_primary TEXT NOT NULL DEFAULT '(11) 3151-2433 / (11) 9468-3765',
    whatsapp_number TEXT NOT NULL DEFAULT '551194683765',
    email TEXT NOT NULL DEFAULT 'contatocentraldaestetica@gmail.com',
    address_line1 TEXT NOT NULL DEFAULT 'Rua Artur Frazão, 33',
    address_line2 TEXT NOT NULL DEFAULT 'Jardim Paulista, São Paulo - SP',
    cep TEXT NOT NULL DEFAULT '01423-030',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/centraldaesteticasp',
    facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com/CENTRALDAESTETICASP',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (id, phone_primary, whatsapp_number, email, address_line1, address_line2, cep, instagram_url, facebook_url)
VALUES ('default', '(11) 3151-2433 / (11) 9468-3765', '551194683765', 'contatocentraldaestetica@gmail.com', 'Rua Artur Frazão, 33', 'Jardim Paulista, São Paulo - SP', '01423-030', 'https://instagram.com/centraldaesteticasp', 'https://facebook.com/CENTRALDAESTETICASP')
ON CONFLICT (id) DO NOTHING;

-- 8. Permissões de Segurança (RLS) para Acesso Anônimo / Público
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all treatments" ON public.treatments;
CREATE POLICY "Allow public all treatments" ON public.treatments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all promotions" ON public.promotions;
CREATE POLICY "Allow public all promotions" ON public.promotions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all testimonials" ON public.testimonials;
CREATE POLICY "Allow public all testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all blog_posts" ON public.blog_posts;
CREATE POLICY "Allow public all blog_posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all bookings" ON public.bookings;
CREATE POLICY "Allow public all bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all site_settings" ON public.site_settings;
CREATE POLICY "Allow public all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
`;

