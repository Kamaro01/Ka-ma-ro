import { supabase } from '../lib/supabase/client';

interface UploadResponse {
  data: {
    path: string;
    publicUrl: string;
  } | null;
  error: Error | null;
}

interface DeleteResponse {
  error: Error | null;
}

export const storageService = {
  async uploadFile(
    bucket: string,
    file: File,
    path: string,
    options?: { upsert?: boolean; contentType?: string }
  ): Promise<UploadResponse> {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = path.includes('.') ? path : `${path}.${fileExt}`;

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        upsert: options?.upsert ?? true,
        contentType: options?.contentType ?? file?.type,
      });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return {
        data: {
          path: data.path,
          publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  },

  async deleteFile(bucket: string, path: string): Promise<DeleteResponse> {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    return { error };
  },

  getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  },
};

// LocalStorage wrapper for client-side data persistence
export const storage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
