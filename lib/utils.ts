import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Image compression using browser-image-compression
 * Install: npm install browser-image-compression
 */
export const compressImage = async (file: File): Promise<File> => {
  try {
    const { default: imageCompression } = await import("browser-image-compression");

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, { type: file.type });
  } catch (error) {
    console.error("Compression failed, using original:", error);
    return file;
  }
};

/**
 * Validate image file
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Sadece JPG, PNG, WebP formatları destekleniyor.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Dosya boyutu 5MB'dan küçük olmalıdır.",
    };
  }

  return { valid: true };
};

/**
 * Generate unique storage path
 */
const generateStoragePath = (file: File): string => {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const uuid = crypto.randomUUID();
  const ext = file.name.split(".").pop();
  return `announcements/${date}/${uuid}.${ext}`;
};

/**
 * Get public URL from storage path
 */
export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from("announcements").getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (file: File): Promise<string> => {
  // 1. Validate
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Compress
  const compressed = await compressImage(file);

  // 3. Generate path
  const path = generateStoragePath(compressed);

  // 4. Upload
  const { data, error } = await supabase.storage.from("announcements").upload(path, compressed, {
    cacheControl: "3600", // 1 hour cache
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload başarısız: ${error.message}`);
  }

  // 5. Return public URL
  return getPublicUrl(data.path);
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  try {
    // Extract path from URL
    // https://<project>.supabase.co/storage/v1/object/public/announcements/2025-02-17/uuid.jpg
    // → announcements/2025-02-17/uuid.jpg
    const pathPart = imageUrl.split("/announcements/")[1];
    if (!pathPart) return;

    const fullPath = `announcements/${pathPart}`;

    const { error } = await supabase.storage.from("announcements").remove([fullPath]);

    if (error) {
      console.error("Image delete error:", error);
      // Don't throw, just log - deletion failure shouldn't break the flow
    }
  } catch (error) {
    console.error("Delete image error:", error);
  }
};

/**
 * Delete multiple images
 */
export const deleteImages = async (imageUrls: (string | null)[]): Promise<void> => {
  const validUrls = imageUrls.filter((url): url is string => !!url);

  for (const url of validUrls) {
    await deleteImage(url);
  }
};
