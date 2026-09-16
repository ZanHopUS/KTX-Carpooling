'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ email và mật khẩu.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.' };
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const studentId = formData.get('studentId') as string;
  const phone = formData.get('phone') as string;
  const university = formData.get('university') as string;
  const dormArea = formData.get('dormArea') as string;
  const dormBuilding = formData.get('dormBuilding') as string;
  const role = (formData.get('role') as string) || 'BOTH';

  if (!email || !password || !fullName || !university || !dormArea || !dormBuilding) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
  }

  const supabase = await createClient();

  // 1. Sign up in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
  }

  // 2. Insert record into public.profiles table
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    full_name: fullName,
    email,
    phone,
    student_id: studentId,
    university,
    dorm_area: dormArea,
    dorm_building: dormBuilding,
    role,
    dorm_card_verified: 'PENDING',
    rating: 5.0,
    status: 'ACTIVE',
  });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
