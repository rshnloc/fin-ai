import React, { useState } from 'react';
import { MonthlyDataPoint, CategoryExpense } from '../types/finance';

interface MonthlyTrendChartProps {
  data: MonthlyDataPoint[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No monthly trend data available.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000);
  const chartHeight = 180;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Income</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Expense</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-sky-400 inline-block"></span>
            <span className="text-slate-300">Net Savings</span>
          </div>
        </div>
      </div>

      <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2 relative">
        {/* Background grid lines */}
        <div className="absolute inset-x-0 top-0 border-b border-slate-800/40 text-[10px] text-slate-400 font-mono flex justify-between">
          <span>${Math.round(maxVal).toLocaleString()}</span>
        </div>
        <div className="absolute inset-x-0 top-1/2 border-b border-slate-800/40 text-[10px] text-slate-400 font-mono flex justify-between">
          <span>${Math.round(maxVal / 2).toLocaleString()}</span>
        </div>

        {data.map((item, idx) => {
          const incHeight = (item.income / maxVal) * chartHeight;
          const expHeight = (item.expense / maxVal) * chartHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-24 bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl z-20 whitespace-nowrap text-xs font-mono">
                  <div className="font-semibold text-slate-200 mb-1">{item.month}</div>
                  <div className="text-emerald-400">Income: ${item.income.toLocaleString()}</div>
                  <div className="text-rose-400">Expense: ${item.expense.toLocaleString()}</div>
                  <div className="text-sky-400 font-bold">
                    Net: ${item.savings.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                <div
                  style={{ height: `${Math.max(incHeight, 4)}px` }}
                  className="w-1/2 max-w-[20px] bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all duration-200"
                />
                <div
                  style={{ height: `${Math.max(expHeight, 4)}px` }}
                  className="w-1/2 max-w-[20px] bg-rose-500/80 hover:bg-rose-400 rounded-t-md transition-all duration-200"
                />
              </div>

              {/* Month label */}
              <span className="text-[11px] text-slate-400 font-medium mt-2 truncate w-full text-center">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CategoryDonutChartProps {
  categories: CategoryExpense[];
  totalExpense: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpense,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryExpense | null>(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No expense category data recorded.
      </div>
    );
  }

  // Calculate SVG stroke dashes for a donut
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {categories.map((cat) => {
            const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += cat.percentage;

            return (
              <circle
                key={cat.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={hoveredCategory?.category === cat.category ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {hoveredCategory ? hoveredCategory.category : 'Total Spent'}
          </span>
          <span className="text-base font-bold text-white font-mono">
            ${hoveredCategory ? hoveredCategory.amount.toLocaleString() : totalExpense.toLocaleString()}
          </span>
          {hoveredCategory && (
            <span className="text-xs text-emerald-400 font-mono font-medium">
              {hoveredCategory.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Category breakdown listing */}
      <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div
            key={cat.category}
            onMouseEnter={() => setHoveredCategory(cat)}
            onMouseLeave={() => setHoveredCategory(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
              hoveredCategory?.category === cat.category
                ? 'bg-slate-800 border border-slate-700'
                : 'hover:bg-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-slate-300">{cat.category}</span>
            </div>
            <div className="flex items-center space-x-3 font-mono">
              <span className="text-slate-400">{cat.percentage}%</span>
              <span className="font-semibold text-slate-200">${cat.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
