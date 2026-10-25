"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFieldValue(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "").trim();
}

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = getFieldValue(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("/login", "請輸入 Email 與密碼。");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithMessage(
      "/login",
      "登入失敗，請確認 Email 與密碼是否正確。",
    );
  }

  redirect("/protected");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = getFieldValue(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("/login", "請輸入 Email 與密碼。");
  }

  if (password.length < 6) {
    redirectWithMessage("/login", "密碼至少需要 6 個字元。");
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/protected`,
    },
  } );

  if (error) {
    redirectWithMessage("/login", "註冊失敗，請稍後再試。");
  }

  // 如果 Supabase 專案關閉 Email Confirmation，
  // signUp 後通常會直接取得 session。
  if (data.session) {
    redirect("/protected");
  }

  // 如果開啟 Email Confirmation，
  // 使用者需要先到信箱點擊確認連結。
  redirectWithMessage(
    "/login",
    "註冊成功，請先到 Email 點擊確認連結，再登入帳戶。",
  );
}
