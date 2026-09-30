'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${color}`}>
      <p className="text-xs font-medium opacity-75 truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 truncate">{value}</p>
      <p className="text-[11px] sm:text-xs opacity-60 mt-0.5 truncate">{sub}</p>
    </div>
  );
}
