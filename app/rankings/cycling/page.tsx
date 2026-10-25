import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CertificationRow = {
  user_email: string;
  events:
    | {
        sport_type: string;
        visibility_status: string;
      }
    | {
        sport_type: string;
        visibility_status: string;
      }[]
    | null;
};

type RankingRow = {
  rank: number;
  email: string;
  count: number;
};

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function buildRankings(rows: CertificationRow[]): RankingRow[] {
  const countByEmail = new Map<string, number>();

  for (const row of rows) {
    const relatedEvents = Array.isArray(row.events)
      ? row.events
      : row.events
        ? [row.events]
        : [];

    const belongsToCycling = relatedEvents.some(
      (event) =>
        event.sport_type === "cycling" &&
        event.visibility_status === "visible",
    );

    if (!belongsToCycling) {
      continue;
    }

    const email = row.user_email.toLowerCase();
    countByEmail.set(email, (countByEmail.get(email) ?? 0) + 1);
  }

  return Array.from(countByEmail.entries())
    .sort(([emailA, countA], [emailB, countB]) => {
      if (countB !== countA) {
        return countB - countA;
      }

      return emailA.localeCompare(emailB);
    })
    .map(([email, count], index) => ({
      rank: index + 1,
      email: maskEmail(email),
      count,
    }));
}

export default async function CyclingRankingsPage() {
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certifications")
    .select(
      `
        user_email,
        events!inner (
          sport_type,
          visibility_status
        )
      `,
    )
    .eq("moderation_status", "normal")
    .eq("events.sport_type", "cycling")
    .eq("events.visibility_status", "visible");

  const rows = (data ?? []) as CertificationRow[];
  const rankings = buildRankings(rows);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-zinc-100 px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/rankings"
          className="text-xs font-black uppercase tracking-[0.22em] text-red-600 hover:text-black"
        >
          ← 百鐵排名分類
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 border-b border-zinc-300 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Cycling Rankings
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] text-zinc-950 sm:text-6xl">
              單車百鐵排名
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600">
              依照公開且狀態正常的單車完賽登錄總數排序。
            </p>
          </div>

          <div className="bg-zinc-950 px-5 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Ranked Members
            </p>
            <p className="mt-1 text-3xl font-black">{rankings.length}</p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-[72px_1fr_110px] border-b border-zinc-200 bg-zinc-950 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-400 sm:grid-cols-[100px_1fr_160px] sm:px-8">
            <span>Rank</span>
            <span>Member</span>
            <span className="text-right">Finishes</span>
          </div>

          {error ? (
            <div className="px-5 py-10 text-sm text-red-700 sm:px-8">
              目前無法讀取排行榜資料，請稍後再試。
            </div>
          ) : rankings.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-zinc-500 sm:px-8">
              目前還沒有公開的單車完賽紀錄。
            </div>
          ) : (
            <div>
              {rankings.map((ranking) => (
                <div
                  key={`${ranking.email}-${ranking.rank}`}
                  className="grid grid-cols-[72px_1fr_110px] items-center border-b border-zinc-100 px-5 py-5 last:border-b-0 sm:grid-cols-[100px_1fr_160px] sm:px-8"
                >
                  <span
                    className={`text-2xl font-black ${
                      ranking.rank <= 3
                        ? "text-red-600"
                        : "text-zinc-300"
                    }`}
                  >
                    {String(ranking.rank).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-bold text-zinc-800 sm:text-base">
                    {ranking.email}
                  </span>

                  <span className="text-right text-2xl font-black text-zinc-950">
                    {ranking.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
