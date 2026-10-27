"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Footer from "@/components/Footer";

interface MemberRoleItem {
  id: string;
  name: string;
  email: string;
  team: string;
  role: "super_admin" | "editor" | "member";
}

const INITIAL_MANAGERS: MemberRoleItem[] = [
  { id: "1", name: "洪緯欣", email: "evelny1985@gmail.com", team: "醫護鐵人", role: "super_admin" },
  { id: "2", name: "陳彥良", email: "pianopub1130@gmail.com", team: "醫護鐵人", role: "super_admin" },
];

export default function AdminRoleManagementPage() {
  const [members, setMembers] = useState<MemberRoleItem[]>(INITIAL_MANAGERS);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState("臺東城鄉生活運動協會");
  const [newRole, setNewRole] = useState<"super_admin" | "editor">("editor");

  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem("g100_role_managers");
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveMembersList = (list: MemberRoleItem[]) => {
    setMembers(list);
    localStorage.setItem("g100_role_managers", JSON.stringify(list));
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const item: MemberRoleItem = {
      id: String(Date.now()),
      name: newName.trim() || "協會管理人員",
      email: newEmail.trim(),
      team: newTeam.trim() || "臺東城鄉生活運動協會",
      role: newRole,
    };

    const updated = [...members, item];
    saveMembersList(updated);
    setNewEmail("");
    setNewName("");
    alert(`✅ 已成功將「${item.name} (${item.email})」委派為【${item.role === "super_admin" ? "第一層：最高管理員" : "第二層：公告與成績編輯管理員"}】！`);
  };

  const handleChangeRole = (id: string, nextRole: "super_admin" | "editor" | "member") => {
    const updated = members.map((m) => (m.id === id ? { ...m, role: nextRole } : m));
    saveMembersList(updated);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              SYSTEM ADMINISTRATION (3-TIER PERMISSIONS)
            </span>
            <h1 className="text-3xl font-black text-white mt-2">
              協會工作人員與三層權限管理後台
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              第一層【最高管理員（可委派人＋編輯公告＋上傳檔案/CSV成績）】｜ 第二層【編輯管理員（可編輯公告＋上傳檔案/CSV成績）】｜ 第三層【一般會員】
            </p>
          </div>
          <Link
            href="/taitung-assoc"
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs sm:text-sm transition shrink-0"
          >
            前往協會專區測試 →
          </Link>
        </div>

        {/* 新增 / 委派管理員表單 */}
        <form onSubmit={handleAddManager} className="rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 sm:p-8 space-y-5 shadow-2xl">
          <h2 className="text-lg font-extrabold text-amber-400">
            ➕ 新增 / 委派協會管理者（由洪緯欣最高管理員授權）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="真實姓名 (如：王小明)"
              className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
            />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="登入 Email *"
              className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
            />
            <input
              type="text"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="所屬單位/團隊"
              className="rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "super_admin" | "editor")}
              className="rounded-xl bg-zinc-900 border border-amber-500/50 px-3 py-2.5 text-sm text-amber-400 font-bold"
            >
              <option value="super_admin">👑 第一層：最高管理員 (可委派+編輯上傳)</option>
              <option value="editor">✏️ 第二層：編輯管理員 (僅編輯公告+上傳檔案)</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition cursor-pointer"
            >
              確認新增並授權
            </button>
          </div>
        </form>

        {/* 權限一覽表 */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-lg font-extrabold text-white">
            網站管理員與三層權限一覽表 ({members.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">真實姓名</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">所屬單位</th>
                  <th className="py-3 px-4">目前三層權限等級</th>
                  <th className="py-3 px-4 text-right">權限調整操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-4 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-300">{m.email}</td>
                    <td className="py-4 px-4 text-xs text-zinc-400">{m.team}</td>
                    <td className="py-4 px-4">
                      {m.role === "super_admin" ? (
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold">
                          👑 第一層：最高管理員 (可委派人＋編輯上傳)
                        </span>
                      ) : m.role === "editor" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold">
                          ✏️ 第二層：編輯管理員 (編輯公告＋上傳檔案/CSV)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                          👤 第三層：一般會員
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.id, e.target.value as any)}
                        className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white font-bold"
                      >
                        <option value="super_admin">設為第一層：最高管理員</option>
                        <option value="editor">設為第二層：編輯管理員</option>
                        <option value="member">設為第三層：一般會員</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
