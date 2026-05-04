// src/scripts/uploadImages.js
// ─────────────────────────────────────────────────────────────
// Run this ONCE to upload all local product images to Supabase
// and link them to the correct products.
//
// HOW TO USE:
//   1. Paste this into your browser console at localhost:5173
//      (while logged in as admin)
//   OR
//   2. Import and call uploadAllImages() from any component
//      temporarily, then remove it after.
// ─────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabaseClient';

// ── Map slug → imported image ─────────────────────────────────
// We fetch the image files from your existing /assets folder
// via the Vite asset URLs that are already bundled.

const PRODUCT_IMAGES = {
  // BRACELETS
  'multi-color-pack-4':          '/src/assets/bracelets/mc4.png',
  'black-white-pack-6':          '/src/assets/Earings/wbb7.png',
  'pink-with-white-bow':         '/src/assets/bracelets/pwwb.png',
  'pink-with-white-star':        '/src/assets/bracelets/pwws.png',
  'pink-with-golden-bead':       '/src/assets/bracelets/fpgb.png',
  'pastel-bracelets-set':        '/src/assets/bracelets/pwgb4.png',
  'black-with-silver-butterfly': '/src/assets/bracelets/resize.png',
  'pink-blue-alternative':       '/src/assets/bracelets/resized.png',
  'two-white-two-black':         '/src/assets/bracelets/twob_twow.png',
  'black-white-alternative':     '/src/assets/bracelets/bw_alternative.png',
  'three-black-one-white':       '/src/assets/bracelets/threeBoneonewhite.png',
  'blue-white-panda-dollar':     '/src/assets/bracelets/bluewhite_panda.png',
  // EARRINGS
  'baby-pink-earrings':          '/src/assets/Earings/baby_pink.png',
  'green-butterfly-earrings':    '/src/assets/Earings/gb.png',
  'golden-rose-earrings':        '/src/assets/Earings/golden_rose.png',
  'pale-green-butterfly-earrings':'/src/assets/Earings/pale_greenB.png',
  'pink-star-earrings':          '/src/assets/Earings/ps.png',
  'yellow-butterfly-earrings':   '/src/assets/Earings/yb.png',
  'silver-s-earrings':           '/src/assets/Earings/silver_S.png',
  'white-pearl-earrings':        '/src/assets/Earings/white_perl.png',
  'red-butterfly-earrings':      '/src/assets/Earings/red_butterfly.png',
};

async function urlToBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.blob();
}

export async function uploadAllImages(onProgress) {
  // 1. Fetch all products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('id, slug')
    .eq('is_active', true);

  if (error) throw error;

  const results = { success: [], failed: [] };
  const total   = products.length;

  for (let i = 0; i < products.length; i++) {
    const product   = products[i];
    const imagePath = PRODUCT_IMAGES[product.slug];

    onProgress?.(`[${i + 1}/${total}] Uploading: ${product.slug}`);

    if (!imagePath) {
      console.warn(`No image mapped for slug: ${product.slug}`);
      results.failed.push(product.slug);
      continue;
    }

    try {
      // Fetch the image as a blob
      const blob     = await urlToBlob(imagePath);
      const ext      = imagePath.split('.').pop();
      const filePath = `${product.id}/primary.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Check if image record already exists
      const { data: existing } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', product.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('product_images')
          .update({ url: publicUrl })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            url:        publicUrl,
            alt_text:   product.slug,
            is_primary: true,
            sort_order: 0,
          });
      }

      results.success.push(product.slug);
      console.log(`✅ ${product.slug}`);
    } catch (err) {
      console.error(`❌ ${product.slug}:`, err.message);
      results.failed.push(product.slug);
    }
  }

  return results;
}