import { api } from '@/lib/api';

/**
 * Shape returned by GET /api/properties (list endpoint).
 * Note: rent_min / rent_max come from the API as strings e.g. "8000.00".
 */
export interface PropertyListItem {
  id: number;
  name: string;
  slug: string;
  rent_min: string;
  rent_max: string;
}

/**
 * Full property as returned by GET /api/public/properties/{slug} (detail endpoint).
 * Kept loose because the detail payload carries many optional fields
 * (images, amenities, locality, city, flags) used by the UI.
 */
export interface PropertyDetail {
  id: number;
  name: string;
  slug: string;
  cover_image?: string | null;
  is_verified?: number | boolean;
  is_featured?: number | boolean;
  gender?: string;
  rent_min?: string | number;
  rent_max?: string | number;
  images?: Array<{ image_path?: string } | string>;
  amenities?: Array<{ id: number; name: string; icon?: string }>;
  locality?: { name?: string };
  city?: { name?: string };
  [key: string]: unknown;
}

/** Standard API envelope used across the PIZI backend. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Safely turn "8000.00" (or 8000) into a number. */
export const toAmount = (v: string | number | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** "₹8,000 – ₹13,500" style range from a list item. */
export const rentRange = (p: Pick<PropertyListItem, 'rent_min' | 'rent_max'>): string => {
  const min = toAmount(p.rent_min);
  const max = toAmount(p.rent_max);
  const fmt = (x: number) => '₹' + x.toLocaleString('en-IN');
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
};

/** GET /api/properties — lightweight list of all properties. */
export async function getProperties(): Promise<PropertyListItem[]> {
  const res = await api.get<ApiEnvelope<PropertyListItem[]>>('/properties');
  return res.data?.data ?? [];
}

/** GET /api/public/properties/{slug} — full property detail. */
export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  const res = await api.get<ApiEnvelope<PropertyDetail>>(`/public/properties/${slug}`);
  return res.data?.data ?? null;
}
