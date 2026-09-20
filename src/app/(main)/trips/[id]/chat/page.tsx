import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ChatClient from './ChatClient';
import { Trip, UserProfile, Message } from '@/types/database';

export default async function TripChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/login');

  // Fetch trip
  const { data: tripData } = await supabase
    .from('trips')
    .select(`
      *,
      driver:profiles!driver_id (*)
    `)
    .eq('id', id)
    .single();

  if (!tripData) notFound();
  const trip = tripData as Trip;

  // Check if current user is driver or accepted passenger
  const isDriver = user.id === trip.driver_id;

  const { data: acceptedReq } = await supabase
    .from('trip_requests')
    .select(`
      *,
      passenger:profiles!passenger_id (*)
    `)
    .eq('trip_id', trip.id)
    .eq('status', 'ACCEPTED')
    .maybeSingle();

  if (!isDriver && acceptedReq?.passenger_id !== user.id) {
    // Unauthorized access to chat
    redirect(`/trips/${id}`);
  }

  // Determine current user profile & other user profile
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const otherUser = isDriver
    ? (acceptedReq?.passenger as UserProfile)
    : (trip.driver as UserProfile);

  if (!currentUserProfile || !otherUser) {
    redirect(`/trips/${id}`);
  }

  // Fetch messages
  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .eq('trip_id', id)
    .order('created_at', { ascending: true });

  const initialMessages = (messagesData as Message[]) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <ChatClient
        trip={trip}
        currentUser={currentUserProfile as UserProfile}
        otherUser={otherUser}
        initialMessages={initialMessages}
      />
    </div>
  );
}
