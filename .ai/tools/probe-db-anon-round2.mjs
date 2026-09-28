// Vòng 2 — read-only anon probe (GET-only), bổ sung ứng viên cột/enum sau vòng 1.
// Cách chạy: node .ai/tools/probe-db-anon-round2.mjs > .ai/reports/probe-anon-20260922-round2.json
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const url = (env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m) || [])[1]?.trim();
const key = (env.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m) || [])[1]?.trim();
const H = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const r = await fetch(`${url}/rest/v1/${path}`, { headers: H });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = text.slice(0, 300); }
  return { status: r.status, code: body?.code ?? null };
}

const COLS = {
  trips: ['pickup_area', 'pickup_building', 'pickup_point', 'destination_university',
    'destination_campus', 'destination_building', 'distance_km', 'payment_method',
    'seats', 'seat_count', 'price', 'price_vnd', 'driver_note', 'meeting_point'],
  profiles: ['first_name', 'last_name', 'is_active', 'banned_at', 'phone_verified',
    'messenger_psid'],
  trip_requests: ['pickup_time', 'requested_at', 'score', 'seats', 'passenger_note', 'trip_note'],
  ratings: ['updated_at'],
  routes: ['source_location_id', 'start_location_id', 'origin_name', 'dorm_area'],
  vehicles: ['owner_id', 'user_id', 'profile_id', 'driver_profile_id', 'owner_user_id'],
  locations: ['display_name', 'short_name', 'category', 'university_code', 'campus_code',
    'is_dorm', 'is_active'],
  trip_reports: ['trip_id', 'reporter_id', 'reported_user_id', 'reason', 'description', 'status',
    'created_at', 'reviewed_by', 'reviewed_at', 'resolution_note'],
  notifications: ['user_id', 'recipient_id', 'type', 'title', 'body', 'content', 'read_at',
    'is_read', 'created_at', 'trip_id', 'payload', 'data', 'link'],
};

const ENUMS = {
  'profiles.verification_status': ['unverified', 'pending', 'verified', 'rejected', 'expired',
    'need_review', 'PENDING', 'VERIFIED', 'REJECTED'],
  'profiles.account_status': ['active', 'blocked', 'suspended', 'banned', 'ACTIVE', 'BLOCKED'],
  'trips.status': ['requested', 'accepted', 'matched', 'scheduled'],
};

const out = { meta: { when: new Date().toISOString(), mode: 'GET-only anon probe round2' }, columns: {}, enums: {} };

for (const [t, cols] of Object.entries(COLS)) {
  out.columns[t] = {};
  for (const c of cols) {
    const r = await get(`${t}?select=${c}&limit=1`);
    out.columns[t][c] = r.code === '42703' ? 'ABSENT' : (r.status < 300 ? 'PRESENT' : `code:${r.code ?? r.status}`);
  }
}
for (const [tc, values] of Object.entries(ENUMS)) {
  const [t, c] = tc.split('.');
  out.enums[tc] = {};
  for (const v of values) {
    const r = await get(`${t}?select=*&${c}=eq.${v}&limit=1`);
    const rm = await (await fetch(`${url}/rest/v1/${t}?select=*&${c}=eq.${v}&limit=1`, { headers: H })).text();
    let m = null; try { m = JSON.parse(rm)?.message ?? null } catch {}
    out.enums[tc][v] = r.code === '22P02' ? `INVALID (${m})` : (r.status < 300 ? 'ACCEPTED' : `code:${r.code ?? r.status}`);
  }
}
console.log(JSON.stringify(out, null, 2));
