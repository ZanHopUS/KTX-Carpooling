import { createClient } from '@/utils/supabase/server';
import { UNIVERSITIES } from '@/utils/constants';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  const supabase = await createClient();

  // Fetch universities directly from Supabase DB `locations` table
  const { data: locationsData } = await supabase
    .from('locations')
    .select('id, name, campus_name')
    .order('name', { ascending: true });

  interface LocationRecord {
    id: string;
    name: string;
    campus_name?: string | null;
  }

  const dbList = ((locationsData as unknown as LocationRecord[]) || [])
    .filter((loc) => loc.name)
    .map((loc) => ({
      id: loc.id || loc.name,
      name: loc.campus_name ? `${loc.name} (${loc.campus_name})` : loc.name,
    }));

  const staticList = UNIVERSITIES.map((u) => ({ id: u.id, name: u.name }));

  // Merge DB locations and static universities, deduplicating by name
  const combined = [...dbList, ...staticList];
  const seenNames = new Set<string>();
  const universitiesList = combined.filter((u) => {
    if (seenNames.has(u.name)) return false;
    seenNames.add(u.name);
    return true;
  });

  return <RegisterFormClient universities={universitiesList} />;
}
