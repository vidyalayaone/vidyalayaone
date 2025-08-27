import httpClient from './httpClient';

export interface DocumentDTO {
  id: string;
  name: string;
  url: string; // s3 key
  mimeType: string;
  fileSize?: number;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const documentsApi = {
  list: async (page = 1, limit = 20): Promise<Paginated<DocumentDTO>> => {
    const res = await httpClient.get<Paginated<DocumentDTO>>(`/api/v1/documents?page=${page}&limit=${limit}`);
    return res.data;
  },
  upload: async (file: File, onProgress?: (pct: number) => void): Promise<{ success: boolean; data: DocumentDTO }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await httpClient.post<{ success: boolean; data: DocumentDTO }>(`/api/v1/documents/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress?.(pct);
      },
    });
    return res.data;
  },
  getSignedUrl: async (id: string): Promise<{ success: boolean; data: DocumentDTO & { signedUrl: string } }> => {
    const res = await httpClient.get<{ success: boolean; data: DocumentDTO & { signedUrl: string } }>(`/api/v1/documents/${id}`);
    return res.data;
  },
};
