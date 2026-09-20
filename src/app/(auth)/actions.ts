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

export async function registerAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const studentId = formData.get('studentId') as string;
  const phone = formData.get('phone') as string;
  const university = formData.get('university') as string;
  const dormArea = formData.get('dormArea') as string;
  const dormBuilding = formData.get('dormBuilding') as string;
  const role = ((formData.get('role') as string) || 'BOTH').toUpperCase();

  if (!email || !password || !fullName || !university || !dormArea || !dormBuilding) {
    return { error: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
  }

  // Validate Student Email Domain
  if (!isValidStudentEmailDomain(email)) {
    return {
      error:
        'Vui lòng sử dụng Email sinh viên do trường cấp (ví dụ: @student.hcmus.edu.vn, @mcs.hcmus.edu.vn, @st.hcmut.edu.vn, @uit.edu.vn...).',
    };
  }

  const supabase = await createClient();

  console.log('=== SIGNUP REQUEST ===', { email, fullName, university });

  // 1. Sign up in Supabase Auth (Trigger OTP confirmation & DB trigger)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        student_id: studentId,
        phone,
        university,
        dorm_area: dormArea,
        dorm_building: dormBuilding,
        role,
      },
      emailRedirectTo: `http://localhost:3000/auth/callback`,
    },
  });

  console.log('=== SUPABASE SIGNUP RESULT ===', {
    user: authData?.user?.id,
    identities: authData?.user?.identities?.length,
    authError: authError?.message || authError,
  });

  if (authError || !authData.user) {
    console.error('Supabase Auth SignUp Error:', authError);

    if (authError?.message?.includes('Error sending confirmation email')) {
      return {
        error:
          'Lỗi từ máy chủ Email của Supabase: Không thể gửi email xác minh đến hòm thư sinh viên (do giới hạn SMTP mặc định của Supabase). Để giải quyết: Truy cập Supabase Dashboard -> Authentication -> Providers -> Email -> TẮT mục "Confirm email" (Xác nhận email), sau đó bấm Đăng ký lại!',
      };
    }

    return { error: authError?.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
  }

  // Check if email already exists (Supabase returns empty identities array for existing users)
  if (authData.user.identities && authData.user.identities.length === 0) {
    return {
      error:
        'Email sinh viên này đã được đăng ký trước đó! Vui lòng truy cập Supabase Dashboard -> Authentication -> Users để XÓA user cũ, hoặc thử bằng 1 email sinh viên khác.',
    };
  }

  // 2. Insert/Update record into public.profiles table (handled gracefully alongside DB trigger)
  try {
    const profilePayload: Record<string, any> = {
      id: authData.user.id,
      full_name: fullName,
      email,
      phone: phone || null,
      student_id: studentId || null,
      university,
      dorm_area: dormArea,
      dorm_building: dormBuilding,
      role,
      email_verified: false,
      dorm_card_verified: 'PENDING',
      rating: 5.0,
      status: 'ACTIVE',
    };

    await supabase.from('profiles').upsert(profilePayload);
  } catch (err) {
    console.log('Profile creation handled by trigger:', err);
  }

  // If user is already logged in (Confirm Email is disabled in Supabase),
  // redirect directly to dashboard instead of showing OTP modal.
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Mark email as verified since no OTP is needed
    await supabase.from('profiles').update({ email_verified: true }).eq('id', authData.user.id);
    redirect('/dashboard');
  }

  return { success: true, requireOtp: true, email };
}

export async function verifyOtpAction(email: string, token: string) {
  if (!email || !token || token.length !== 6) {
    return { error: 'Mã OTP không hợp lệ. Vui lòng nhập mã gồm 6 chữ số.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    // Try verification as email type if signup type fails
    const { data: retryData, error: retryError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (retryError) {
      return { error: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.' };
    }
  }

  // Update profile status to email_verified = true
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ email_verified: true }).eq('id', user.id);
  }

  // Use server-side redirect to avoid client router.push issues
  redirect('/dashboard');
}

export async function resendOtpAction(email: string) {
  if (!email) return { error: 'Thiếu email nhận mã OTP.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    return { error: 'Không thể gửi lại mã OTP. Vui lòng thử lại sau giây lát.' };
  }

  return { success: true, message: 'Đã gửi lại mã OTP về hòm thư sinh viên!' };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
