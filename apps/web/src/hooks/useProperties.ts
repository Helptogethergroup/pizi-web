'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getProperties,
  getPropertyBySlug,
  type PropertyListItem,
  type PropertyDetail,
} from '@/lib/properties';

/** List all properties from GET /api/properties. */
export function useProperties() {
  return useQuery<PropertyListItem[]>({
    queryKey: ['properties'],
    queryFn: getProperties,
    staleTime: 60_000, // 1 min — list doesn't change every second
  });
}

/** Single property detail from GET /api/public/properties/{slug}. */
export function usePropertyBySlug(slug: string | undefined) {
  return useQuery<PropertyDetail | null>({
    queryKey: ['property', slug],
    queryFn: () => getPropertyBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
