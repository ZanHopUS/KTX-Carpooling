export const DORM_AREAS = [
  { id: 'KHU_A', name: 'Ký túc xá Khu A' },
  { id: 'KHU_B', name: 'Ký túc xá Khu B' },
] as const;

export const DORM_BUILDINGS = {
  KHU_A: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A15', 'A16', 'A17', 'A18', 'A19', 'A20'],
  KHU_B: ['B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'E1'],
} as const;

export const UNIVERSITIES = [
  {
    id: 'HCMUS',
    name: 'Trường ĐH Khoa học Tự nhiên (VNUHCM-HCMUS)',
    campuses: ['Cơ sở 1 (227 Nguyễn Văn Cừ, Q.5)', 'Cơ sở 2 (Linh Trung, TP. Thủ Đức)'],
  },
  {
    id: 'HCMUT',
    name: 'Trường ĐH Bách khoa (VNUHCM-HCMUT)',
    campuses: ['Cơ sở 1 (Lý Thường Kiệt, Q.10)', 'Cơ sở 2 (Linh Trung, TP. Thủ Đức)'],
  },
  {
    id: 'UIT',
    name: 'Trường ĐH Công nghệ Thông tin (VNUHCM-UIT)',
    campuses: ['Cơ sở chính (Linh Trung, TP. Thủ Đức)'],
  },
  {
    id: 'USSH',
    name: 'Trường ĐH Khoa học Xã hội và Nhân văn (VNUHCM-USSH)',
    campuses: ['Cơ sở 1 (Đinh Tiên Hoàng, Q.1)', 'Cơ sở 2 (Linh Trung, TP. Thủ Đức)'],
  },
  {
    id: 'IU',
    name: 'Trường ĐH Quốc Tế (VNUHCM-IU)',
    campuses: ['Cơ sở chính (Linh Trung, TP. Thủ Đức)'],
  },
  {
    id: 'UEL',
    name: 'Trường ĐH Kinh tế - Luật (VNUHCM-UEL)',
    campuses: ['Cơ sở chính (Linh Trung, TP. Thủ Đức)'],
  },
] as const;

export const TRIP_STATUS = {
  OPEN: 'OPEN',             // Chuyến đang tìm hành khách
  REQUESTED: 'REQUESTED',   // Có hành khách gửi yêu cầu
  ACCEPTED: 'ACCEPTED',     // Tài xế đã chấp nhận
  IN_PROGRESS: 'IN_PROGRESS',// Chuyến đang thực hiện
  COMPLETED: 'COMPLETED',   // Chuyến đã hoàn thành
  CANCELLED: 'CANCELLED',   // Chuyến bị hủy
  EXPIRED: 'EXPIRED',       // Chuyến hết thời gian chờ
  REPORTED: 'REPORTED',     // Chuyến có báo cáo sự cố
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',       // Đang chờ xác minh
  VERIFIED: 'VERIFIED',     // Đã xác minh thành công
  REJECTED: 'REJECTED',     // Hồ sơ bị từ chối
  NEED_REVIEW: 'NEED_REVIEW'// Cần kiểm tra lại
} as const;

export const PRICING_CONFIG = {
  PRICE_PER_KM: 2000,
  MINIMUM_PRICE: 5000,
} as const;

export const ALLOWED_STUDENT_EMAIL_DOMAINS = [
  'student.hcmus.edu.vn',
  'mcs.hcmus.edu.vn',
  'hcmus.edu.vn',
  'st.hcmut.edu.vn',
  'hcmut.edu.vn',
  'student.uit.edu.vn',
  'uit.edu.vn',
  'student.ussh.edu.vn',
  'ussh.edu.vn',
  'student.hcmiu.edu.vn',
  'hcmiu.edu.vn',
  'st.uel.edu.vn',
  'uel.edu.vn',
] as const;

export function isValidStudentEmailDomain(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  // Check if domain is in allowed list or ends with .edu.vn
  return ALLOWED_STUDENT_EMAIL_DOMAINS.some((allowed) => domain === allowed) || domain.endsWith('.edu.vn');
}

