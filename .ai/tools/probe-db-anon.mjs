// Read-only DB evidence prober — TASK-003 (Orchestrator tooling)
// Chỉ thực hiện GET qua PostgREST với anon key:
//   - tồn tại bảng  : PGRST205 (không có) vs 2xx/42501 (có)
//   - tồn tại cột   : PGRST204 (không có) vs 2xx (có)
//   - enum hợp lệ   : 22P02 invalid input value for enum "<type>" (không hợp lệ) vs 2xx (hợp lệ)
// Không chạy DDL/DML. RLS/grants được tôn trọng — anon không thấy gì thì ghi "không đọc được".
// Cách chạy: node .ai/tools/probe-db-anon.mjs > ket-qua.json
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const url = (env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m) || [])[1]?.trim();
const key = (env.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m) || [])[1]?.trim();
if (!url || !key) { console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local'); process.exit(1); }

const H = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: H });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text.slice(0, 300); }
  return { status: r.status, body };
}

const code = (r) => r.body?.code ?? null;
const msg = (r) => r.body?.message ?? (typeof r.body === 'string' ? r.body : null);

// ---------- 1. Tồn tại bảng + hàng anon đọc được (keys của hàng đầu = cột thật) ----------
const TABLES = ['profiles', 'trips', 'trip_requests', 'messages', 'ratings',
  'locations', 'routes', 'vehicles', 'trip_reports', 'notifications'];

// ---------- 2. Ứng viên cột (từ code + docs + CSV trips) ----------
const COLS = {
  profiles: ['id', 'email', 'full_name', 'phone', 'university', 'student_id', 'dorm_area',
    'dorm_building', 'dorm_card_url', 'dorm_card_verified', 'role', 'rating', 'average_rating',
    'rating_count', 'completed_trip_count', 'cancelled_trip_count', 'email_verified', 'status',
    'account_status', 'verification_note', 'verification_status', 'school', 'date_of_birth',
    'avatar_url', 'messenger_id', 'created_at', 'updated_at'],
  trips: ['id', 'driver_id', 'vehicle_id', 'route_id', 'pickup_location_id', 'trip_date', 'date',
    'departure_time', 'class_start_time', 'class_end_time', 'distance_meters_snapshot',
    'duration_seconds_snapshot', 'price_snapshot', 'currency', 'note', 'notes', 'status',
    'accepted_passenger_id', 'accepted_request_id', 'cancelled_by', 'cancelled_at',
    'cancellation_reason', 'cancellation_note', 'expired_at', 'started_at', 'completed_at',
    'updated_at', 'created_at', 'available_seats', 'pickup_time', 'suggested_price'],
  trip_requests: ['id', 'trip_id', 'passenger_id', 'requested_pickup_time', 'match_score',
    'message', 'note', 'status', 'responded_at', 'responded_by', 'created_at', 'updated_at'],
  ratings: ['id', 'trip_id', 'from_user_id', 'to_user_id', 'stars', 'score', 'comment',
    'available_at', 'created_at'],
  locations: ['id', 'name', 'label', 'type', 'kind', 'latitude', 'longitude', 'lat', 'lng',
    'university', 'campus', 'area', 'building', 'address', 'code', 'created_at'],
  routes: ['id', 'origin_id', 'destination_id', 'from_location_id', 'to_location_id',
    'origin_location_id', 'destination_location_id', 'distance_meters', 'duration_seconds',
    'created_at'],
  vehicles: ['id', 'driver_id', 'type', 'vehicle_type', 'plate', 'license_plate', 'brand',
    'model', 'color', 'created_at'],
};

// ---------- 3. Ứng viên giá trị enum (thường + HOA) ----------
const ENUMS = {
  'trips.status': ['open', 'full', 'expired', 'in_progress', 'completed', 'cancelled',
    'OPEN', 'FULL', 'EXPIRED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
    'REQUESTED', 'ACCEPTED', 'ACTIVE'],
  'trips.cancellation_reason': ['driver_cancelled', 'passenger_cancelled', 'schedule_change',
    'weather', 'other', 'DRIVER_CANCELLED', 'OTHER'],
  'trip_requests.status': ['pending', 'accepted', 'rejected', 'cancelled', 'expired',
    'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  'profiles.role': ['user', 'admin', 'driver', 'passenger', 'both',
    'USER', 'ADMIN', 'DRIVER', 'PASSENGER', 'BOTH'],
  'profiles.dorm_card_verified': ['unverified', 'pending', 'verified', 'rejected', 'expired',
    'need_review', 'PENDING', 'VERIFIED', 'REJECTED', 'NEED_REVIEW'],
};

const out = { meta: { url: url.replace(/\/\/[^.]+\./, '//<ref>.'), when: new Date().toISOString(), mode: 'GET-only anon probe' }, tables: {}, columns: {}, enums: {} };

for (const t of TABLES) {
  const r = await get(`${t}?select=*&limit=2`);
  const row = Array.isArray(r.body) ? r.body[0] : null;
  out.tables[t] = {
    status: r.status, code: code(r), message: msg(r),
    readable: Array.isArray(r.body), rows_seen: Array.isArray(r.body) ? r.body.length : 0,
    row_keys: row ? Object.keys(row) : null,
  };
  if (r.status === 401 || r.status === 403) { /* skip further probing */ }
}

for (const [t, cols] of Object.entries(COLS)) {
  out.columns[t] = {};
  const info = out.tables[t];
  if (info && (code(info) === 'PGRST205')) { out.columns[t].__table_missing = true; continue; }
  for (const c of cols) {
    const r = await get(`${t}?select=${c}&limit=1`);
    out.columns[t][c] = code(r) === 'PGRST204' ? 'ABSENT' : (r.status < 300 ? 'PRESENT' : `code:${code(r) ?? r.status}`);
  }
}

for (const [tc, values] of Object.entries(ENUMS)) {
  const [t, c] = tc.split('.');
  out.enums[tc] = {};
  const info = out.tables[t];
  if (info && (code(info) === 'PGRST205')) { out.enums[tc].__table_missing = true; continue; }
  for (const v of values) {
    const r = await get(`${t}?select=*&${c}=eq.${v}&limit=1`);
    if (code(r) === '22P02') out.enums[tc][v] = `INVALID (${msg(r)})`;
    else if (r.status < 300) out.enums[tc][v] = 'ACCEPTED';
    else out.enums[tc][v] = `code:${code(r) ?? r.status}`;
  }
}

console.log(JSON.stringify(out, null, 2));
