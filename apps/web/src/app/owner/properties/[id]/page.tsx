'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PropertyForm } from '@/components/properties/PropertyForm';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: property, isLoading } = useQuery({
    queryKey: ['owner-property', id],
    queryFn: async () => (await api.get(`/owner/properties/${id}`)).data.data,
  });

  if (isLoading || !property) return <div className="text-center py-20">Loading...</div>;

  return <PropertyForm mode="edit" initialData={property} apiBase="/owner/properties" listPath="/owner/properties" />;
}
