export type UserRole = 'DRIVER' | 'PASSENGER' | 'BOTH' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEED_REVIEW';
export type TripStatus = 'OPEN' | 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'REPORTED';
export type TripRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  student_id?: string;
  university?: string;
  dorm_area?: string;
  dorm_building?: string;
  email_verified: boolean;
  dorm_card_verified: VerificationStatus;
  dorm_card_url?: string;
  rating: number;
  completed_trip_count: number;
  cancelled_trip_count: number;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED';
  created_at: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  driver?: UserProfile;
  date: string; // YYYY-MM-DD
  pickup_time: string; // HH:mm
  pickup_area: string; // e.g. KHU_B
  pickup_building: string; // e.g. B2
  pickup_point: string; // e.g. Trước sảnh tòa B2
  destination_university: string; // e.g. HCMUS
  destination_campus?: string;
  destination_building?: string;
  class_period?: number;
  class_start_time?: string;
  available_seats: number;
  distance_km: number;
  suggested_price: number;
  payment_method: PaymentMethod;
  notes?: string;
  status: TripStatus;
  created_at: string;
}

export interface TripRequest {
  id: string;
  trip_id: string;
  trip?: Trip;
  passenger_id: string;
  passenger?: UserProfile;
  requested_pickup_time: string;
  match_score: number;
  status: TripRequestStatus;
  created_at: string;
}

export interface Rating {
  id: string;
  trip_id: string;
  from_user_id: string;
  to_user_id: string;
  stars: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface TripReport {
  id: string;
  trip_id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export interface Message {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
