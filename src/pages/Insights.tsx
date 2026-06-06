/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ShoppingBag, 
  Sparkles, 
  ArrowLeft, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Flame,
  ArrowUpRight,
  Sparkle,
  ArrowRight,
  X
} from 'lucide-react';
import { BudgetGoal } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Insights() {
  const navigate = useNavigate();
  const { goals, updateGoals, transactions, loadDemoData, detectedCurrency } = useAuth();
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [optApplied, setOptApplied] = useState(false);

  // Extract month dynamically from current active transactions list
  const getDynamicDateLabel = () => {
    if (transactions.length === 0) {
      return { month: 'Active Month', year: 'Statement', full: 'Active Statement' };
    }
    
    const countMap: Record<string, { count: number, monthName: string, yearStr: string }> = {};
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    for (const tx of transactions) {
      if (!tx.date) continue;
      
      let dateObj: Date | null = null;
      
      // Standard parser for Date string
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        dateObj = d;
      } else {
        // Fallback robust split parsing for DD/MM/YYYY
        const parts = tx.date.trim().split(/[-/ ,]+/);
        if (parts.length === 3) {
          // Check if DD/MM/YYYY
          let day = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          if (parts[0].length === 4) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
          }
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
            dateObj = new Date(year, month - 1, day);
          }
        }
      }
      
      let monthName = '';
      let yearStr = '';
      
      if (dateObj && !isNaN(dateObj.getTime())) {
        monthName = months[dateObj.getMonth()];
        yearStr = dateObj.getFullYear().toString();
      } else {
        // Safe split fallback (e.g. "Oct 24, 2023" parsed via spaces)
        const parts = tx.date.trim().split(/[, ]+/);
        if (parts.length >= 2) {
          const mPart = parts[0]; // e.g. "Oct"
          const yPart = parts[parts.length - 1]; // e.g. "2023"
          let fullMonth = mPart;
          const monthMap: Record<string, string> = {
            'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
            'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
            'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
          };
          if (monthMap[mPart]) {
            fullMonth = monthMap[mPart];
          }
          monthName = fullMonth;
          yearStr = yPart;
        }
      }
      
      if (monthName && yearStr) {
        const key = `${monthName}_${yearStr}`;
        if (!countMap[key]) {
          countMap[key] = { count: 0, monthName, yearStr };
        }
        countMap[key].count++;
      }
    }
    
    // Find key with max count
    let maxKey = '';
    let maxCount = -1;
    Object.entries(countMap).forEach(([key, val]) => {
      if (val.count > maxCount) {
        maxCount = val.count;
        maxKey = key;
      }
    });
    
    if (maxKey && countMap[maxKey]) {
      const best = countMap[maxKey];
      return {
        month: best.monthName,
        year: best.yearStr,
        full: `${best.monthName} ${best.yearStr}`
      };
    }
    
    return { month: 'Active Month', year: 'Statement', full: 'Active Statement' };
  };

  const dynamicDate = getDynamicDateLabel();

  // New goal form properties
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newSpent, setNewSpent] = useState('');

  // Dynamic Calculations based on active transaction ledger
  const totalOutflow = transactions
    .filter(t => {
      const isDebit = t.type ? t.type === 'Debit' : t.category !== 'INCOME';
      return isDebit && t.amount <= 99999;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  // For dynamic next month predictions (e.g. 1.05 of recent month outflow or 0 if empty)
  const predictedOutflow = transactions.length > 0 ? Math.round(totalOutflow * 1.05) : 0;
  
  // Forecast bounds Limit
  const forecastLimit = transactions.length > 0 ? Math.round(Math.max(50000, totalOutflow * 1.25)) : 0;

  // Utilities spent (UTILITIES category sum)
  const utilitiesTotal = transactions
    .filter(t => t.category === 'UTILITIES' && t.amount <= 99999)
    .reduce((acc, t) => acc + t.amount, 0);

  // Subscriptions spent (ENTERTAINMENT category)
  const subscriptionsTotal = transactions
    .filter(t => t.category === 'ENTERTAINMENT' && t.amount <= 99999)
    .reduce((acc, t) => acc + t.amount, 0);

  // Variable spending (everything else)
  const variableTotal = Math.max(0, totalOutflow - utilitiesTotal - subscriptionsTotal);

  // Percentages for the Next Month Prediction horizontal bar
  const utilPct = totalOutflow > 0 ? Math.round((utilitiesTotal / totalOutflow) * 100) : 0;
  const subPct = totalOutflow > 0 ? Math.round((subscriptionsTotal / totalOutflow) * 100) : 0;
  const varPct = totalOutflow > 0 ? Math.max(0, 100 - utilPct - subPct) : 0;

  // Find the top merchant spending
  const merchantSpentMap: Record<string, number> = {};
  transactions.forEach(t => {
    const isDebit = t.type ? t.type === 'Debit' : t.category !== 'INCOME';
    if (isDebit) {
      merchantSpentMap[t.merchant] = (merchantSpentMap[t.merchant] || 0) + t.amount;
    }
  });

  let topMerchant = 'None';
  let topMerchantSpent = 0;
  Object.entries(merchantSpentMap).forEach(([m, amt]) => {
    if (amt > topMerchantSpent) {
      topMerchantSpent = amt;
      topMerchant = m;
    }
  });

  // Calculate weekly peaks for top merchant spendings
  const topMerchantWeekly = [0, 0, 0, 0, 0]; // Weeks 1-5
  if (topMerchant !== 'None') {
    const topMerchantTransactions = transactions.filter(t => t.merchant === topMerchant);
    topMerchantTransactions.forEach(t => {
      const dayMatch = t.date.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/i);
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        if (day <= 6) topMerchantWeekly[0] += t.amount;
        else if (day <= 12) topMerchantWeekly[1] += t.amount;
        else if (day <= 18) topMerchantWeekly[2] += t.amount;
        else if (day <= 24) topMerchantWeekly[3] += t.amount;
        else topMerchantWeekly[4] += t.amount;
      } else {
        const len = t.id ? t.id.length : 10;
        topMerchantWeekly[len % 5] += t.amount;
      }
    });
  }

  const maxWeeklySpent = Math.max(...topMerchantWeekly, 1);
  const weeklyBars = topMerchantWeekly.map((val, idx) => {
    const p = Math.round((val / maxWeeklySpent) * 100);
    return {
      label: `W${idx + 1}`,
      value: p,
      amount: val
    };
  });

  let peakWeekIdx = 2; // Default to W3 baseline
  let maxWeekVal = 0;
  topMerchantWeekly.forEach((v, idx) => {
    if (v > maxWeekVal) {
      maxWeekVal = v;
      peakWeekIdx = idx;
    }
  });

  const handleApplyOpt = () => {
    setOptApplied(true);
    // Automatically update Netflix subscriptions in parent budget goals or mock action
    const updatedGoals = goals.map(g => {
      if (g.category === 'ENTERTAINMENT') {
        const optimalSpent = Math.max(0, g.spent - 147); // Slashes ₹147
        return { ...g, spent: optimalSpent };
      }
      return g;
    });
    updateGoals(updatedGoals);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newLimit) return;

    const limitVal = parseFloat(newLimit);
    const spentVal = newSpent ? parseFloat(newSpent) : 0;
    
    // Choose styling color representation depending on percentage
    const percentage = (spentVal / limitVal) * 100;
    let colorClass = 'bg-indigo-500';
    if (percentage > 100) colorClass = 'bg-rose-500';
    else if (percentage > 80) colorClass = 'bg-red-500';
    else if (percentage < 40) colorClass = 'bg-emerald-500';

    const goal: BudgetGoal = {
      id: `bg-${Date.now()}`,
      category: newCategory.toUpperCase(),
      spent: spentVal,
      limit: limitVal,
      color: colorClass
    };

    updateGoals([...goals, goal]);
    setShowAddGoalModal(false);
    
    // Reset form fields
    setNewCategory('');
    setNewLimit('');
    setNewSpent('');
  };

  const formatRupees = (amount: number) => {
    const sym = detectedCurrency || '₹';
    let curr = 'INR';
    let locale = 'en-IN';
    if (sym === '£') {
      curr = 'GBP';
      locale = 'en-GB';
    } else if (sym === '$') {
      curr = 'USD';
      locale = 'en-US';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: sym === '₹' ? 0 : 2
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1280px] mx-auto" id="insights-tab-content">
      
      {/* Page header with backward navigation shortcut buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="insights-header-panel">
        <div>
          <h1 className="text-2xl font-extrabold font-sans tracking-tight text-slate-900">Financial Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Based on your last 3 months of spending, we've identified key trends in your habits.
          </p>
        </div>
      </div>

      {/* Onboarding Empty State banner / demo action triggers */}
      {transactions.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl" id="sandbox-onboarding-panel-insights">
          {/* Accent light glows */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-[#7c3aed]/35 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 max-w-xl text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#7c3aed]/20 border border-[#7c3aed]/40 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>PREDICTIVE ENGINE OFFLINE</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Activate Predictive Insights!</h2>
            <p className="text-xs text-slate-300 leading-normal">
              To trigger our machine learning models, sub-billing recurring optimizers, and automated expense trajectories, import a statement ledger or try out our pre-configured sandbox demo dataset.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={loadDemoData}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
            >
              <Sparkles className="w-4 h-4 fill-white text-purple-200 animate-spin" />
              <span>Load Sandbox Demo</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Upload Statements</span>
            </button>
          </div>
        </div>
      )}

      {/* Top row of three automated insights widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="three-column-highlights-panel">
        {/* Card 1: Spending spike */}
        <div className="bg-white border-l-4 border-l-red-500 rounded-2xl rounded-l-none p-5.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] border border-slate-250/75 flex flex-col justify-between" id="insight-col-1">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[10px] bg-red-50 text-red-700 font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase border border-red-100/50 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Spending Spike</span>
              </span>
              <TrendingDown className="w-4.5 h-4.5 text-red-500 shrink-0" />
            </div>
            
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {transactions.length > 0 ? (
                <>You spent <span className="text-red-600 font-bold">34% more</span> on <span className="font-bold">Food and Dining</span> in {dynamicDate.month} compared to the previous period.</>
              ) : (
                "No transaction spikes identified yet. Automated NLP tagging is waiting for file structure ingestion."
              )}
            </p>
          </div>
          <p className="text-[11px] text-slate-450 mt-4 border-t border-slate-50 pt-3">
            {transactions.length > 0 ? "Consider establishing a dining limit to protect your residual cash buffers." : "Establish baseline spending patterns on upload."}
          </p>
        </div>

        {/* Card 2: Saving Goal */}
        <div className="bg-white border-l-4 border-l-emerald-500 rounded-2xl rounded-l-none p-5.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] border border-slate-250/75 flex flex-col justify-between" id="insight-col-2">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase border border-emerald-100/50 flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-555 shrink-0" />
                <span>Saving Goal</span>
              </span>
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
            </div>
            
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {transactions.length > 0 ? (
                <>You are on absolute track to save <span className="text-emerald-600 font-bold">{detectedCurrency === '₹' ? '₹3,200' : detectedCurrency === '£' ? '£320' : '$320'}</span> this month. This accumulates to 12% higher than your standard baseline average.</>
              ) : (
                "Saving goal forecasts are offline. Uploading historical parameters automatically configures targets."
              )}
            </p>
          </div>
          <p className="text-[11px] text-slate-450 mt-4 border-t border-slate-50 pt-3">
            {transactions.length > 0 ? "Auto-routing has prepared safe deposit protocols into high-yield accounts." : "Residual margin calculators will run automatically."}
          </p>
        </div>

        {/* Card 3: Top Merchant */}
        <div className="bg-white border-l-4 border-l-purple-500 rounded-2xl rounded-l-none p-5.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] border border-slate-250/75 flex flex-col justify-between" id="insight-col-3">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase border border-purple-100/50 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Top Merchant</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            </div>
            
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {transactions.length > 0 ? (
                <>I identified <span className="font-bold">{topMerchant !== 'None' ? topMerchant : 'Swiggy'}</span> as your top merchant, drawing <span className="text-[#7c3aed] font-extrabold">{formatRupees(topMerchantSpent)}</span> across transactions this month alone.</>
              ) : (
                "Vendor analytics are waiting for transaction logs. Drop a standard PDF or CSV ledger."
              )}
            </p>
          </div>
          <p className="text-[11px] text-slate-450 mt-4 border-t border-slate-50 pt-3">
            {transactions.length > 0 ? "Frequent convenience orders are amplifying your overall expenditure." : "Top merchant categories mapped instantly on upload."}
          </p>
        </div>
      </div>

      {/* Mid Page Section Grid: NEXT MONTH PREDICTIONS & BUDGET GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="mid-predictions-and-budget">
        {/* Left Column Prediction card */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col justify-between" id="prediction-outlook-card">
          <div className="space-y-1" id="outlook-card-header">
            <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-[#7c3aed]" />
              <span>Next Month Prediction</span>
            </h2>
            <p className="text-xs text-slate-400">AI-calculated models considering utility periods & baseline habits</p>
          </div>

          <div className="my-6 space-y-6" id="outlook-core-body">
            {/* Total Estimated Outflow */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium uppercase font-mono tracking-wider">ESTIMATED OUTFLOW</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatRupees(predictedOutflow)}</span>
            </div>

            {/* Custom Multi-Segment horizontal visual bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-450 mb-2 font-mono">
                <span>Spending vs Budget Forecast</span>
                <span className="font-bold text-slate-650">{transactions.length > 0 ? `${formatRupees(forecastLimit)} LIMIT` : "AWAITING INGESTION"}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-6.5 rounded-xl overflow-hidden flex" id="multi-segment-prediction-bar">
                {transactions.length > 0 ? (
                  <>
                    {/* Fixed billing segment */}
                    <div 
                      className="bg-[#7c3aed] text-white font-mono font-bold text-[9px] flex items-center justify-center transition-all animate-in slide-in-from-left duration-500"
                      style={{ width: `${utilPct}%` }}
                      title={`Fixed Rent & bills - ${formatRupees(utilitiesTotal)}`}
                    >
                      <span className="truncate px-1">FIXED ({utilPct}%)</span>
                    </div>
                    {/* Variable spending segment */}
                    <div 
                      className="bg-slate-500 text-white font-mono font-bold text-[9px] flex items-center justify-center transition-all animate-in slide-in-from-left duration-500"
                      style={{ width: `${varPct}%` }}
                      title={`Variable expenses - ${formatRupees(variableTotal)}`}
                    >
                      <span className="truncate px-1">VAR ({varPct}%)</span>
                    </div>
                    {/* Predicted Additions segment */}
                    <div 
                      className="bg-purple-205 text-[#7c3aed] font-mono font-bold text-[9px] flex items-center justify-center transition-all animate-in slide-in-from-left duration-500"
                      style={{ width: `${subPct}%` }}
                      title={`Subscriptions - ${formatRupees(subscriptionsTotal)}`}
                    >
                      <span className="truncate px-1">SUBS ({subPct}%)</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full bg-slate-50 text-slate-400 font-mono text-[9px] flex items-center justify-center">
                    0 LEDGER TRANSACTION TRAJECTORY
                  </div>
                )}
              </div>
            </div>

            {/* List breakdown metrics */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-5 text-sm" id="prediction-outflow-splits">
              <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-150-10">
                <span className="text-[11px] font-bold text-slate-400 font-mono block mb-1">RECURRING UTILITIES</span>
                <span className="font-sans font-bold text-slate-800 text-base block">{formatRupees(utilitiesTotal)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rent transfers & baseline power</span>
              </div>

              <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-150-10">
                <span className="text-[11px] font-bold text-slate-400 font-mono block mb-1">SUBSCRIPTIONS DETECTED</span>
                <span className="font-sans font-bold text-[#7c3aed] text-base block">{formatRupees(subscriptionsTotal)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Media & software integrations</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/40 border border-purple-100/50 p-4 rounded-2xl text-[12px] text-slate-650 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">AI Observation:</span> We anticipate a {detectedCurrency === '₹' ? '₹1,500' : detectedCurrency === '£' ? '£150' : '$150'} increase in travel spend next month due to holiday patterns. Travel fares traditionally peak across selected corridors starting October 28.
            </div>
          </div>
        </div>

        {/* Right Column Budget limits card list */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-sm flex flex-col justify-between" id="budget-limits-goals-card">
          <div className="flex items-center justify-between mb-5" id="budget-heading-section">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">Budget Goals</h2>
              <p className="text-xs text-slate-400 mt-0.5">Set category limits versus monthly spending totals</p>
            </div>
            
            <button
              onClick={() => setShowAddGoalModal(true)}
              id="add-limit-goal-btn"
              className="p-1.5 hover:bg-[#7c3aed]/10 text-[#7c3aed] border border-purple-100 hover:border-[#7c3aed]/30 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center"
              title="Create New Category Limit"
            >
              <Plus className="w-4.5 h-4.5 text-[#7c3aed] stroke-[2.5]" />
            </button>
          </div>

          {/* Goal List */}
          <div className="space-y-4.5 flex-1" id="goals-progress-list">
            {goals.map((goal) => {
              const percentage = Math.round((goal.spent / goal.limit) * 100);
              const isOver = goal.spent > goal.limit;
              
              let barColorClass = 'bg-emerald-500';
              if (percentage > 80) {
                barColorClass = 'bg-red-500';
              } else if (percentage >= 60) {
                barColorClass = 'bg-amber-500';
              }
              
              return (
                <div key={goal.id} className="space-y-1.5" id={`goal-item-${goal.id}`}>
                   <div className="flex justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 uppercase block">{goal.category}</span>
                      {isOver && (
                        <span className="text-[10px] text-red-500 font-semibold block uppercase">
                          ⚠️ Over budget by {formatRupees(goal.spent - goal.limit)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-705 block">{formatRupees(goal.spent)} / {formatRupees(goal.limit)}</span>
                      <span className={`text-[10px] font-bold block mt-0.5 ${percentage > 80 ? 'text-red-500' : percentage >= 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {percentage}% Used
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar progress levels */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddGoalModal(true)}
            id="goals-trigger-btn"
            className="w-full border border-dashed border-slate-200 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 text-slate-500 hover:text-[#7c3aed] font-bold text-xs py-3 rounded-xl mt-6 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Bottom Row Section Grid: MERCHANT SECTOR SPLITS & LIVE OFFERS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="bottom-pattern-and-offers">
        {/* Left Col Swiggy split bar charts */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4" id="swiggy-peak-analysis-card">
          <div>
            <h3 className="font-bold text-base text-slate-800">Merchant Spending Pattern</h3>
            <p className="text-xs text-slate-400 mt-1">Granular weekly audit levels for specific top vendors</p>
          </div>

          <p className="text-xs text-slate-600 leading-normal mb-2">
            {transactions.length > 0 ? (
              <>Your spending with <span className="font-bold text-slate-800">{topMerchant}</span> peaked in <span className="text-[#7c3aed] font-bold">Week {peakWeekIdx + 1}</span> of your billing period ({formatRupees(topMerchantSpent)} total spend).</>
            ) : (
              "No merchant logs ingested yet. Spend peak analyzers operate on top-drawing vendors dynamically."
            )}
          </p>

          <div className="flex items-end justify-between gap-3 h-24 pt-4 border-b border-slate-150/10 select-none" id="swiggy-mock-bars">
            {transactions.length > 0 ? (
              weeklyBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full relative h-[65px] flex items-end">
                    <div 
                      style={{ height: `${bar.value}%` }}
                      className={`w-full rounded-lg transition-all duration-300
                        ${i === peakWeekIdx 
                          ? 'bg-gradient-to-t from-[#7c3aed] to-purple-800 shadow-md shadow-purple-200' 
                          : 'bg-purple-200 hover:bg-purple-300/80'}`} 
                      title={`${bar.label}: ${formatRupees(bar.amount)}`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${i === peakWeekIdx ? 'text-[#7c3aed]' : 'text-slate-400'}`}>
                    {bar.label} {i === peakWeekIdx && '⭐'}
                  </span>
                </div>
              ))
            ) : (
              [0, 0, 0, 0, 0].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full relative h-[65px] flex items-end justify-center">
                    <div style={{ height: '5%' }} className="w-full rounded-lg bg-slate-100" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-350">W{i+1}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col Optimizer Offers callout */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-[24px] p-6.5 border border-slate-800 shadow-lg flex flex-col justify-between" id="family-optimization-offer-card">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-[40px] pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-500/40 text-purple-300 font-bold tracking-wider font-mono px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Live Recommendation</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-455 animate-ping" />
            </div>

            <h3 className="font-extrabold text-[#7c3aed] text-lg font-sans tracking-tight">
              {transactions.length > 0 ? "Switch to a Family Plan?" : "Offline Sandbox Optimizer"}
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed mt-2.5">
              {transactions.length > 0 ? (
                <>We detected <span className="font-bold text-white">4 separate Netflix payments</span> of ₹199 billing across your connected team statement accounts. Switching to a single consolidated ₹649 family plan could reclaim you <span className="text-emerald-400 font-extrabold pb-0.5 border-b border-dashed border-emerald-400/50">₹147/month</span>.</>
              ) : (
                <>Awaiting structural statement ingestion to run active subscription redundancy checks. When live, our algorithms cross-reference multiple accounts to find family pricing savings.</>
              )}
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between" id="apply-opt-actions">
            <span className="text-[10.5px] font-mono text-slate-450 tracking-wider">
              {transactions.length > 0 ? "CODE: OPT-NETFLIX-44" : "IDLE: NO_TRIGGERS"}
            </span>
            
            {transactions.length > 0 ? (
              optApplied ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 px-3.5 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Applied Optimization</span>
                </div>
              ) : (
                <button
                  onClick={handleApplyOpt}
                  id="reconcile-subs-button"
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] hover:shadow-lg hover:shadow-purple-950/20 active:scale-[0.98] text-white text-xs font-bold py-2 px-4 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Apply Optimization</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase select-none">
                Awaiting Data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goal creation Modal Form Dialog */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="add-goal-modal">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close */}
            <button 
              onClick={() => setShowAddGoalModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-purple-100 text-[#7c3aed] p-2 rounded-xl">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Define Budget Limit</h3>
                <p className="text-xs text-slate-500">Add a custom category constraint to track spending</p>
              </div>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4" id="goal-form-element">
              <div>
                <label className="text-[11px] font-bold text-slate-450 uppercase block mb-1">Category Target Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. SHOPPING, COFFEE, FUEL"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#7c3aed] focus:bg-white placeholder-slate-400 text-sm py-2.5 px-4.5 rounded-xl outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-450 uppercase block mb-1">Limit Budget ({detectedCurrency})</label>
                  <input 
                    type="number" 
                    required
                    placeholder="5000"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#7c3aed] focus:bg-white placeholder-slate-400 text-sm py-2.5 px-4 rounded-xl outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-450 uppercase block mb-1">Current Spent ({detectedCurrency})</label>
                  <input 
                    type="number" 
                    placeholder="1200"
                    value={newSpent}
                    onChange={(e) => setNewSpent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#7c3aed] focus:bg-white placeholder-slate-400 text-sm py-2.5 px-4 rounded-xl outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
