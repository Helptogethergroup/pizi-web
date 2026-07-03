'use client';

import { PropertyForm } from '@/components/properties/PropertyForm';

export default function Page() {
  return <PropertyForm mode="create" apiBase="/owner/properties" listPath="/owner/properties" />;
}
