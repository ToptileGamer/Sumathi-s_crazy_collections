// src/services/productService.js
import { supabase } from '../lib/supabaseClient';

// ── Get all categories ────────────────────────────────────
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

// ── Get products (with filters) ───────────────────────────
export async function getProducts({
  categorySlug = null,
  search       = null,
  featured     = false,
  sortBy       = 'created_at',   // 'price_asc' | 'price_desc' | 'rating' | 'created_at'
  page         = 1,
  limit        = 12,
} = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `, { count: 'exact' })
    .eq('is_active', true);

  if (categorySlug) {
    // join via category slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (featured) query = query.eq('is_featured', true);

  if (search) query = query.ilike('name', `%${search}%`);

  // Sorting
  switch (sortBy) {
    case 'price_asc':  query = query.order('price', { ascending: true  }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating':     query = query.order('rating_avg', { ascending: false }); break;
    default:           query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: data, total: count, page, limit };
}

// ── Get single product by slug ────────────────────────────
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary, sort_order),
      reviews(
        id, rating, title, body, created_at, is_verified,
        user:profiles(full_name, avatar_url)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

// ── Get featured products ─────────────────────────────────
export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit });
}

// ── Admin: create product ─────────────────────────────────
export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: update product ─────────────────────────────────
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: delete product (soft delete) ───────────────────
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

// ── Admin: upload product image ───────────────────────────
export async function uploadProductImage(productId, file, isPrimary = false) {
  const ext      = file.name.split('.').pop();
  const filePath = `${productId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url: publicUrl, is_primary: isPrimary })
    .select()
    .single();
  if (error) throw error;
  return data;
}
