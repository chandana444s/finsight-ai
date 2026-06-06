/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function MetricCard({
  id,
  title,
  value,
  trend = 'neutral',
  trendLabel,
  icon: Icon,
  iconBgColor = 'bg-slate-100',
  iconTextColor = 'text-slate-600'
}: MetricCardProps) {
  // Render the appropriate arrow icon and colors depending on trend direction
  const renderTrend = () => {
    if (!trendLabel) return null;

    if (trend === 'up') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5" id={`${id}-trend-up`}>
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-rose-650 bg-rose-50 px-2 py-0.5 rounded-full mt-1.5" id={`${id}-trend-down`}>
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full mt-1.5" id={`${id}-trend-neutral`}>
        <Minus className="w-3.5 h-3.5" />
        <span>{trendLabel}</span>
      </span>
    );
  };

  return (
    <div
      id={id}
      className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.02),0_2px_4px_-2px_rgb(0,0,0,0.02)] hover:border-purple-200 hover:shadow-[0_10px_15px_-3px_rgba(124,58,237,0.04),0_4px_6px_-4px_rgba(124,58,237,0.04)] transition-all duration-300 flex justify-between items-start cursor-default group"
    >
      <div className="flex flex-col h-full justify-between pr-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 font-mono uppercase block mb-1">
            {title}
          </span>
          <span className="text-3xl font-bold text-slate-905 tracking-tight font-sans transition-all duration-200 group-hover:text-[#7c3aed]">
            {value}
          </span>
        </div>
        
        {/* Trend percentage details subtext block */}
        <div className="flex select-none">
          {renderTrend()}
        </div>
      </div>

      <div className={`p-3.5 rounded-2xl ${iconBgColor} ${iconTextColor} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}>
        <Icon className="w-5.5 h-5.5 shrink-0 stroke-[2.2]" />
      </div>
    </div>
  );
}
