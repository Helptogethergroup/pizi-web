// Shared types between API + Web

export type UserRole =
  | 'admin'
  | 'owner'
  | 'tenant'
  | 'field_executive'
  | 'telecaller'
  | 'seo_manager'
  | 'user';

export type PropertyType = 'pg' | 'hostel' | 'apartment' | 'coliving';
export type GenderType = 'male' | 'female' | 'unisex';
export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type TenantStatus = 'active' | 'notice_period' | 'left' | 'blacklisted';
export type BillStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export const ROLES = {
  ADMIN: 'admin' as const,
  OWNER: 'owner' as const,
  TENANT: 'tenant' as const,
  FIELD_EXEC: 'field_executive' as const,
  TELECALLER: 'telecaller' as const,
  SEO: 'seo_manager' as const,
};

export const KYC_DOC_TYPES = [
  'aadhaar_front',
  'aadhaar_back',
  'pan',
  'employment_id',
  'student_id',
  'address_proof',
  'photo',
  'other',
] as const;

export const COMPLAINT_CATEGORIES = [
  'plumbing',
  'electrical',
  'wifi',
  'housekeeping',
  'food',
  'furniture',
  'security',
  'ac',
  'water',
  'other',
] as const;
