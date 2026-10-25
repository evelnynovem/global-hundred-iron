"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getUserAndRole() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile && profile.role === "admin") {
          setIsAdmin(true);
        }
      }
    }
    getUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="全球百鐵認證"
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow"
          />
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-gray-900 tracking-tight">全球百鐵認證</span>
            <span className="text-gray-300">|</span>
            <Link
              href="/association"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition"
            >
              🏛️ 台東城鄉生活運動協會
            </Link>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/rankings" className="text-sm font-semibold text-gray-700 hover:text-red-600 transition">
            成績查詢
          </Link>
          <Link href="/certifications" className="text-sm font-semibold text-gray-700 hover:text-red-600 transition">
            完賽登錄
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow transition hover:bg-orange-600"
                >
                  👑 管理後台
                </Link>
              )}
              <Link
                href="/profile"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-bold rounded-xl transition"
              >
                會員中心
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition border border-red-200"
              >
                登出
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition"
            >
              會員中心
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}