import { SupabaseClient } from '@supabase/supabase-js';
import { Trip, TripStatus } from '@/types/database';

export interface DriverDependencies {
  vehicle_id: string;
  pickup_location_id: string;
  route_id: string;
}

/**
 * Ensures that the required FK dependencies (vehicle, locations, route)
 * exist in the database for the given trip insert request.
 * Creates fallback defaults if none are found.
 */
export async function ensureDriverDependencies(
  supabase: SupabaseClient,
  userId: string,
  pickupArea: string,
  destinationUniversity: string,
  destinationCampus: string | null,
  distanceKm: number
): Promise<DriverDependencies> {
  // 1. Vehicle lookup / creation
  let vehicleId: string | null = null;
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (vehicles && vehicles.length > 0) {
    vehicleId = vehicles[0].id;
  } else {
    const { data: newVehicle, error: vehicleErr } = await supabase
      .from('vehicles')
      .insert({
        owner_id: userId,
        vehicle_type: 'motorbike',
        license_plate: '59-KTX1',
        brand: 'Honda',
        is_active: true,
        verification_status: 'verified'
      })
      .select('id')
      .single();

    if (vehicleErr || !newVehicle) {
      console.error('Failed to create default vehicle:', vehicleErr);
      throw new Error('Không thể tạo thông tin xe mặc định cho tài xế.');
    }
    vehicleId = newVehicle.id;
  }

  // 2. Pickup location lookup / creation
  let pickupLocationId: string | null = null;
  const pickupName = `KTX Khu ${pickupArea}`;
  const { data: pickupLocs } = await supabase
    .from('locations')
    .select('id')
    .ilike('name', `%${pickupArea}%`)
    .limit(1);

  if (pickupLocs && pickupLocs.length > 0) {
    pickupLocationId = pickupLocs[0].id;
  } else {
    const { data: newPickupLoc, error: pickupLocErr } = await supabase
      .from('locations')
      .insert({
        name: pickupName,
        address: `Khu KTX ${pickupArea}, ĐHQG TP.HCM`,
        is_predefined: true,
        is_active: true
      })
      .select('id')
      .single();

    if (pickupLocErr || !newPickupLoc) {
      console.error('Failed to create pickup location:', pickupLocErr);
      throw new Error('Không thể tạo địa điểm đón mặc định.');
    }
    pickupLocationId = newPickupLoc.id;
  }

  // 3. Destination location lookup / creation
  let destLocationId: string | null = null;
  const destName = destinationCampus ? `${destinationUniversity} (${destinationCampus})` : destinationUniversity;
  const { data: destLocs } = await supabase
    .from('locations')
    .select('id')
    .ilike('name', `%${destinationUniversity}%`)
    .limit(1);

  if (destLocs && destLocs.length > 0) {
    destLocationId = destLocs[0].id;
  } else {
    const { data: newDestLoc, error: destLocErr } = await supabase
      .from('locations')
      .insert({
        name: destName,
        address: destName,
        is_predefined: true,
        is_active: true
      })
      .select('id')
      .single();

    if (destLocErr || !newDestLoc) {
      console.error('Failed to create destination location:', destLocErr);
      throw new Error('Không thể tạo địa điểm đến mặc định.');
    }
    destLocationId = newDestLoc.id;
  }

  // 4. Route lookup / creation
  let routeId: string | null = null;
  const { data: routes } = await supabase
    .from('routes')
    .select('id')
    .eq('start_location_id', pickupLocationId)
    .eq('destination_location_id', destLocationId)
    .eq('travel_mode', 'motorcycle')
    .limit(1);

  if (routes && routes.length > 0) {
    routeId = routes[0].id;
  } else {
    const distanceMeters = Math.max(100, Math.round(distanceKm * 1000));
    const durationSeconds = Math.max(60, Math.round((distanceKm / 30) * 3600));

    const { data: newRoute, error: routeErr } = await supabase
      .from('routes')
      .insert({
        start_location_id: pickupLocationId,
        destination_location_id: destLocationId,
        travel_mode: 'motorcycle',
        distance_meters: distanceMeters,
        duration_seconds: durationSeconds,
        status: 'active'
      })
      .select('id')
      .single();

    if (routeErr || !newRoute) {
      console.error('Failed to create route:', routeErr);
      throw new Error('Không thể tạo tuyến đường mặc định.');
    }
    routeId = newRoute.id;
  }

  if (!vehicleId || !pickupLocationId || !routeId) {
    throw new Error('Thiếu thông tin ràng buộc phương tiện/địa điểm/tuyến đường.');
  }

  return {
    vehicle_id: vehicleId as string,
    pickup_location_id: pickupLocationId as string,
    route_id: routeId as string
  };
}



/**
 * Formats a HH:mm string to valid HH:mm:ss for Postgres time without time zone column
 */

export function formatTimeForPostgres(timeStr: string): string {
  if (!timeStr) return '07:00:00';
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return `${timeStr}:00`;
  }
  return timeStr;
}

/**
 * Builds the DB insert payload for the `trips` table,
 * populating BOTH the 26 normalized columns and 13 flat extension columns.
 */

export function toDbTripInsertPayload(
  userId: string,
  data: {
    date: string;
    pickupTime: string;
    pickupArea: string;
    pickupBuilding: string;
    pickupPoint: string;
    destinationUniversity: string;
    destinationCampus: string | null;
    destinationBuilding: string | null;
    distanceKm: number;
    suggestedPrice: number;
    availableSeats: number;
    paymentMethod: string;
    notes: string | null;
  },
  deps: DriverDependencies
) {
  const formattedTime = formatTimeForPostgres(data.pickupTime);
  const distanceMeters = Math.max(100, Math.round(data.distanceKm * 1000));
  const durationSeconds = Math.max(60, Math.round((data.distanceKm / 30) * 3600));

  return {
    // --- 26 Normalized DB Columns ---
    driver_id: userId,
    vehicle_id: deps.vehicle_id,
    route_id: deps.route_id,
    pickup_location_id: deps.pickup_location_id,
    trip_date: data.date,
    departure_time: formattedTime,
    class_start_time: '07:00:00',
    class_end_time: '11:00:00',
    distance_meters_snapshot: distanceMeters,
    duration_seconds_snapshot: durationSeconds,
    price_snapshot: Math.round(data.suggestedPrice),
    currency: 'VND',
    status: 'open', // Postgres trip_status enum lowercase!

    // --- 13 Flat Extension Columns ---
    date: data.date,
    pickup_time: data.pickupTime,
    pickup_area: data.pickupArea,
    pickup_building: data.pickupBuilding,
    pickup_point: data.pickupPoint,
    destination_university: data.destinationUniversity,
    destination_campus: data.destinationCampus,
    destination_building: data.destinationBuilding,
    distance_km: data.distanceKm,
    suggested_price: data.suggestedPrice,
    available_seats: data.availableSeats,
    payment_method: data.paymentMethod,
    notes: data.notes
  };
}

/**
 * Converts a DB row (which could be normalized, flat, or a hybrid)
 * into a clean App `Trip` DTO suitable for rendering.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toAppTripDTO(row: any): Trip {
  if (!row) return {} as Trip;

  const rawStatus = (row.status || 'open').toString().toUpperCase();

  return {
    id: row.id,
    driver_id: row.driver_id,
    driver: row.profiles
      ? {
          id: row.profiles.id,
          full_name: row.profiles.full_name || 'Tài xế KTX',
          email: row.profiles.email || '',
          phone: row.profiles.phone || '',
          student_id: row.profiles.student_id,
          university: row.profiles.university,
          dorm_area: row.profiles.dorm_area,
          dorm_building: row.profiles.dorm_building,
          email_verified: row.profiles.email_verified ?? true,
          dorm_card_verified: (row.profiles.verification_status || 'UNVERIFIED').toString().toUpperCase(),
          dorm_card_url: row.profiles.dorm_card_url,
          rating: Number(row.profiles.average_rating || row.profiles.rating || 5),
          completed_trip_count: Number(row.profiles.completed_trip_count || 0),
          cancelled_trip_count: Number(row.profiles.cancelled_trip_count || 0),
          role: (row.profiles.role || 'USER').toString().toUpperCase(),
          status: (row.profiles.account_status || 'ACTIVE').toString().toUpperCase(),
          created_at: row.profiles.created_at || ''
        }
      : row.driver,
    date: row.date || row.trip_date || '',
    pickup_time: row.pickup_time || row.departure_time || '',
    pickup_area: row.pickup_area || 'A',
    pickup_building: row.pickup_building || '',
    pickup_point: row.pickup_point || '',
    destination_university: row.destination_university || '',
    destination_campus: row.destination_campus || undefined,
    destination_building: row.destination_building || undefined,
    available_seats: row.available_seats ?? 1,
    distance_km: Number(row.distance_km || (row.distance_meters_snapshot ? row.distance_meters_snapshot / 1000 : 3)),
    suggested_price: Number(row.suggested_price || row.price_snapshot || 15000),
    payment_method: (row.payment_method || 'CASH').toString().toUpperCase(),
    notes: row.notes || row.note || undefined,
    status: rawStatus as TripStatus,
    created_at: row.created_at || new Date().toISOString()
  };
}
