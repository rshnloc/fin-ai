import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  color = 'emerald',
}) => {
  const badgeClasses = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  }[badgeType];

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
          <div className="text-2xl font-bold text-white mt-1.5 font-mono tracking-tight">{value}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shadow-inner">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || badge) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/60">
          <span className="text-slate-400">{subtext}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium font-mono ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
