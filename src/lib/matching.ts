import { Trip, UserProfile } from '@/types/database';

export interface MatchingCriteria {
  date: string;
  pickup_time: string; // HH:mm
  passenger_university: string;
  passenger_campus?: string;
  passenger_building?: string;
  passenger_profile?: UserProfile;
}

export interface MatchResult {
  trip: Trip;
  match_score: number;
  breakdown: {
    school_score: number;
    campus_score: number;
    time_score: number;
    pickup_score: number;
    reputation_score: number;
  };
}

/**
 * Calculates time difference in minutes between two "HH:mm" strings
 */
export function getTimeDifferenceInMinutes(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  const mins1 = h1 * 60 + m1;
  const mins2 = h2 * 60 + m2;
  return Math.abs(mins1 - mins2);
}

/**
 * Step 1: Rule-based Filtering (Section 7.2)
 */
export function filterCompatibleTrips(trips: Trip[], criteria: MatchingCriteria): Trip[] {
  return trips.filter((trip) => {
    // 1. Same date
    if (trip.date !== criteria.date) return false;

    // 2. Pickup time difference <= 5 minutes
    const timeDiff = getTimeDifferenceInMinutes(trip.pickup_time, criteria.pickup_time);
    if (timeDiff > 5) return false;

    // 3. Driver has available seats
    if (trip.available_seats <= 0) return false;

    // 4. Trip status is OPEN
    if (trip.status !== 'OPEN') return false;

    // 5. Compatible destination university
    if (
      trip.destination_university.toLowerCase() !==
      criteria.passenger_university.toLowerCase()
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Step 2: Scoring Formula (Section 7.3)
 */
export function calculateMatchScore(trip: Trip, criteria: MatchingCriteria): MatchResult {
  let school_score = 0;
  let campus_score = 0;
  let time_score = 0;
  let pickup_score = 0;
  let reputation_score = 0;

  // Same University (+40)
  if (
    trip.destination_university.toLowerCase() ===
    criteria.passenger_university.toLowerCase()
  ) {
    school_score = 40;
  }

  // Same Campus (+25)
  if (
    criteria.passenger_campus &&
    trip.destination_campus &&
    trip.destination_campus.toLowerCase() === criteria.passenger_campus.toLowerCase()
  ) {
    campus_score = 25;
  }

  // Time Difference Score (+25 exact, +20 for 1-2 min, +10 for 3-5 min)
  const timeDiff = getTimeDifferenceInMinutes(trip.pickup_time, criteria.pickup_time);
  if (timeDiff === 0) {
    time_score = 25;
  } else if (timeDiff <= 2) {
    time_score = 20;
  } else if (timeDiff <= 5) {
    time_score = 10;
  }

  // Driver Reputation (+10 for rating >= 4.5)
  if (trip.driver && trip.driver.rating >= 4.5) {
    reputation_score += 10;
  }

  const match_score =
    school_score + campus_score + time_score + pickup_score + reputation_score;

  return {
    trip,
    match_score,
    breakdown: {
      school_score,
      campus_score,
      time_score,
      pickup_score,
      reputation_score,
    },
  };
}

/**
 * Ranks filtered trips by match score descending
 */
export function rankTrips(trips: Trip[], criteria: MatchingCriteria): MatchResult[] {
  const compatibleTrips = filterCompatibleTrips(trips, criteria);
  const scoredResults = compatibleTrips.map((trip) =>
    calculateMatchScore(trip, criteria)
  );

  return scoredResults.sort((a, b) => b.match_score - a.match_score);
}
