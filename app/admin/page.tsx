"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileUser {
  id: string;
  email: string;
  full_name: string;
  team_name: string;
  role: string;
  violation_count: number;
  is_banned: boolean;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadUsers() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // 檢查目前登入者是否為 admin
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!myProfile || myProfile.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // 載入所有註冊會員清單
      const { data: profilesList } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (profilesList) {
        setUsers(profilesList);
      }
      setLoading(false);
    }

    checkAdminAndLoadUsers();
  }, [supabase, router]);

  // 切換會員身分 (user <-> admin)
  const handleToggleRole = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const actionText = newRole === "admin" ? "設為工作人員/管理員" : "降級為一般會員";

    if (!confirm(`確定要將此會員${actionText}嗎？`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (error) {
      setFeedback("更新權限失敗：" + error.message);
    } else {
      setFeedback("✅ 會員權限已成功更新！");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-zinc-400">載入管理後台中...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="text-4xl">⛔</div>
        <h1 className="text-xl font-black text-white">權限不足</h1>
        <p className="text-xs text-zinc-400 max-w-md">
          您目前沒有存取管理後台的權限。請確認您的帳號是否已被設定為系統管理員。
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-amber-400 text-black text-xs font-bold rounded-xl transition"
        >
          返回首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              SYSTEM ADMINISTRATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">協會工作人員與權限管理後台</h1>
            <p className="text-xs text-zinc-400 mt-1">
              在此直接指定網站會員為「協會工作人員」，解鎖台東城鄉生活運動協會專區的編輯與上傳權限。
            </p>
          </div>
          <Link
            href="/association"
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition shadow"
          >
            前往協會專區測試 →
          </Link>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-sm font-bold">
            {feedback}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white">網站註冊會員與權限一覽表 ({users.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase bg-zinc-950">
                  <th className="py-3 px-3">真實姓名</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">運動團隊</th>
                  <th className="py-3 px-3">目前身分權限</th>
                  <th className="py-3 px-3">違規次數</th>
                  <th className="py-3 px-3 text-right">權限調整操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-3 font-bold text-white">{u.full_name || "未填寫"}</td>
                    <td className="py-3.5 px-3 text-xs font-mono text-zinc-300">{u.email}</td>
                    <td className="py-3.5 px-3 text-xs text-zinc-400">{u.team_name || "個人"}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === "admin"
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {u.role === "admin" ? "👑 協會工作人員" : "👤 一般會員"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs">
                      {u.violation_count > 0 ? (
                        <span className="text-red-400 font-bold">{u.violation_count} 次</span>
                      ) : (
                        <span className="text-zinc-500">0 次</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                          u.role === "admin"
                            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                      >
                        {u.role === "admin" ? "設為一般會員" : "設為工作人員"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}