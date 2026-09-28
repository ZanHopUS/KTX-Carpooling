'use server';

import { createClient } from '@/utils/supabase/server';
import { isValidStudentEmailDomain } from '@/utils/constants';
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

/**
 * Register Action - Direct 2-step Flow (Student Info -> Password -> Register)
 */
export async function registerAction(data: {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  dormArea: string;
  dormBuilding: string;
  password: string;
}) {
  const email = data.email?.trim().toLowerCase();
  const { fullName, phone, university, dormArea, dormBuilding, password } = data;

  if (!email || !password || !fullName || !phone || !university || !dormArea || !dormBuilding) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
  }

  if (password.length < 6) {
    return { error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }

  // Validate Student Email Domain (@...edu.vn)
  if (!isValidStudentEmailDomain(email)) {
    return {
      error:
        'Vui lòng sử dụng Email sinh viên do trường cấp (ví dụ: @student.hcmus.edu.vn, @st.hcmut.edu.vn, @uit.edu.vn...).',
    };
  }

  const supabase = await createClient();

  // 1. Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        university,
        dorm_area: dormArea,
        dorm_building: dormBuilding,
        role: 'user',
      },
    },
  });

  let userId = authData?.user?.id;

  if (authError && !authError.message?.includes('already registered')) {
    // If Supabase default SMTP complains about confirmation email, ignore and proceed
    if (!authError.message?.includes('Error sending confirmation email') && authError.status !== 500) {
      console.error('Supabase Auth SignUp Error:', authError);
      return { error: authError.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
    }
  }

  if (authData?.user?.identities && authData.user.identities.length === 0) {
    return { error: 'Email sinh viên này đã được đăng ký trước đó! Vui lòng Đăng nhập.' };
  }

  // 2. Upsert profile into public.profiles table
  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    userId = userData?.user?.id;
  }


  if (userId) {
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        email,
        phone,
        university,
        dorm_area: dormArea,
        dorm_building: dormBuilding,
        role: 'user', // DB enum user_role
        account_status: 'pending', // DB enum account_status
        verification_status: 'unverified', // DB enum verification_status
        email_verified: true,
        average_rating: 5.0,
        completed_trip_count: 0,
        cancelled_trip_count: 0,
      });
    } catch (err) {
      console.error('Upsert profile error:', err);
    }
  }

  // 3. Auto Sign in to establish session
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
