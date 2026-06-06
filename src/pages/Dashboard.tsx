/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  ArrowUpRight, 
  TrendingDown, 
  Sparkles, 
  TrendingUp, 
  Utensils, 
  Layers, 
  ArrowRight,
  Info,
  DollarSign,
  PiggyBank,
  CheckCircle,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import MetricCard from '../components/MetricCard';
import TransactionTable from '../components/TransactionTable';
import { INITIAL_TRANSACTIONS } from '../data';

// Data for monthly spending trend bar chart
const TREND_DATA = [
  { name: 'May', spending: 28000, color: '#e8dfee' },
  { name: 'Jun', spending: 36000, color: '#e8dfee' },
  { name: 'Jul', spending: 31000, color: '#e8dfee' },
  { name: 'Aug', spending: 44000, color: '#e8dfee' },
  { name: 'Sep', spending: 39000, color: '#e8dfee' },
  { name: 'Oct', spending: 45200, color: '#7c3aed' }, // Highlight October
];

// Data for spending by category donut chart
const CATEGORY_CHART_DATA = [
  { name: 'Food', value: 12800, color: '#7c3aed' },
  { name: 'Transport', value: 6400, color: '#ca8a04' },
  { name: 'Shopping', value: 7200, color: '#475569' },
  { name: 'Entertainment', value: 4500, color: '#dc2626' },
  { name: 'Others', value: 14300, color: '#a78bfa' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, transactions, statements, loadDemoData, detectedCurrency } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';

  // Extract month and year dynamically from transactions.
  // Standard format is e.g. "Oct 15, 2023" or similar. Let's parse the dates.
  const getDynamicDateLabel = () => {
    if (!statements || statements.length === 0) {
      if (transactions.length > 0) {
        return { month: 'October', year: '2023', full: 'October 2023' };
      }
      return { month: 'Active', year: 'Statement', full: 'Active Statement' };
    }
    
    // Get month/year of each active statement
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const parsedStatements = statements.map(s => {
      if (s.detectedMonth && s.detectedYear) {
        return { month: s.detectedMonth, year: Number(s.detectedYear) };
      }
      
      const lowerName = s.filename.toLowerCase();
      let foundMonth = 'October';
      let foundYear = 2023;
      
      for (let i = 0; i < 12; i++) {
        if (lowerName.includes(monthsFull[i].toLowerCase()) || lowerName.includes(monthsShort[i].toLowerCase())) {
          foundMonth = monthsFull[i];
          break;
        }
      }
      const yearMatch = s.filename.match(/\b(20[12]\d)\b/);
      if (yearMatch) {
        foundYear = parseInt(yearMatch[1], 10);
      }
      return { month: foundMonth, year: foundYear };
    });
    
    if (parsedStatements.length === 1) {
      const single = parsedStatements[0];
      return {
        month: single.month,
        year: String(single.year),
        full: `${single.month} ${single.year}`
      };
    }
    
    // Sort statements chronologically by year and month index
    parsedStatements.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthsFull.indexOf(a.month) - monthsFull.indexOf(b.month);
    });
    
    const first = parsedStatements[0];
    const last = parsedStatements[parsedStatements.length - 1];
    
    if (first.month === last.month && first.year === last.year) {
      return {
        month: first.month,
        year: String(first.year),
        full: `${first.month} ${first.year}`,
        sameMonthCount: parsedStatements.length
      };
    }
    
    const fullRange = `${first.month} ${first.year} – ${last.month} ${last.year}`;
    return {
      month: `${first.month} – ${last.month}`,
      year: String(first.year),
      full: fullRange
    };
  };

  const dynamicDate = getDynamicDateLabel();

  // Dynamic calculations based on active transaction ledger
  const totalSpent = transactions
    .filter(tx => {
      const isDebit = tx.type ? tx.type === 'Debit' : tx.category !== 'INCOME';
      return isDebit && tx.amount <= 99999;
    })
    .reduce((acc, tx) => acc + tx.amount, 0);

  const salaryCreditAmounts = transactions
    .filter(tx => {
      const isCredit = tx.type ? tx.type === 'Credit' : tx.category === 'INCOME';
      return isCredit && tx.amount <= 99999;
    })
    .map(tx => tx.amount);

  const maxIncome = salaryCreditAmounts.length > 0 ? Math.max(...salaryCreditAmounts) : 0;

  const savedThisMonth = Math.max(0, maxIncome > 0 ? (maxIncome - totalSpent) : (transactions.length > 0 ? 12500 : 0));

  // Category totals mapping
  const categoryMap: Record<string, number> = {};
  transactions.forEach(tx => {
    const isDebit = tx.type ? tx.type === 'Debit' : tx.category !== 'INCOME';
    if (isDebit && tx.amount <= 99999) {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    }
  });

  let biggestCategory = 'None';
  let biggestAmount = 0;
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    if (amt > biggestAmount) {
      biggestAmount = amt;
      biggestCategory = cat;
    }
  });

  const formattedBiggestCategory = biggestCategory !== 'None'
    ? biggestCategory.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'No Data';

  // Dynamic Category chart data representation
  const categoryColors: Record<string, string> = {
    FOOD: '#7c3aed',
    TRANSPORT: '#ca8a04',
    SHOPPING: '#475569',
    ENTERTAINMENT: '#dc2626',
    UTILITIES: '#3b82f6',
    HEALTHCARE: '#f43f5e',
    HOUSING: '#a21caf',
    OTHERS: '#a78bfa'
  };

  const dynamicCategoryData = Object.entries(categoryMap).map(([name, value]) => {
    const friendlyName = name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    return {
      name: friendlyName,
      value,
      color: categoryColors[name] || '#a78bfa'
    };
  });

  const CATEGORY_CHART_DATA = dynamicCategoryData.length > 0
    ? dynamicCategoryData
    : [{ name: 'Awaiting Statement Ingestion', value: 100, color: '#f1f5f9' }];
  // Each uploaded file = one bar in the chart.
  // Bar label = the month name from that file.
  // Total Spent = sum of all debit transactions in that file.
  const dynamicTrendData = (() => {
    if (!statements || statements.length === 0) {
      return [];
    }
    
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const parsed = statements.map(s => {
      // Get month and year of the statement
      let monthIndex = 9; // Oct default
      let mName = 'Oct';
      let yearVal = 2023;
      
      if (s.detectedMonth && s.detectedYear) {
        const fullIdx = monthsFull.indexOf(s.detectedMonth);
        if (fullIdx !== -1) {
          monthIndex = fullIdx;
          mName = monthsShort[fullIdx];
        } else {
          const shortIdx = monthsShort.findIndex(m => m.toLowerCase() === s.detectedMonth!.toLowerCase().slice(0, 3));
          if (shortIdx !== -1) {
            monthIndex = shortIdx;
            mName = monthsShort[shortIdx];
          }
        }
        yearVal = Number(s.detectedYear);
      } else {
        const lowerName = s.filename.toLowerCase();
        let foundMonthIdx = 9;
        for (let i = 0; i < 12; i++) {
          if (lowerName.includes(monthsFull[i].toLowerCase()) || lowerName.includes(monthsShort[i].toLowerCase())) {
            foundMonthIdx = i;
            break;
          }
        }
        monthIndex = foundMonthIdx;
        mName = monthsShort[foundMonthIdx];
        const yearMatch = s.filename.match(/\b(20[12]\d)\b/);
        if (yearMatch) {
          yearVal = parseInt(yearMatch[1], 10);
        }
      }
      
      let spending = 0;
      const key = `statement_txs_${user?.email.trim().toLowerCase() || 'guest'}_${s.filename}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const txs = JSON.parse(stored) as any[];
          spending = txs
            .filter(tx => tx.type ? tx.type === 'Debit' : tx.category !== 'INCOME')
            .reduce((sum, tx) => sum + tx.amount, 0);
        } catch(e){}
      } else {
        const dMatch = s.filename.includes('HDFC') ? 'HDFC_Aug2023_Statement.pdf' :
                       s.filename.includes('ICICI') ? 'ICICI_Business_Q2.csv' : 
                       s.filename.includes('SBI') ? 'SBI_Savings_July.pdf' : null;
        if (dMatch) {
          const dKey = `statement_txs_${user?.email || 'guest'}_${dMatch}`;
          const dStored = localStorage.getItem(dKey);
          if (dStored) {
            try {
              const txs = JSON.parse(dStored) as any[];
              spending = txs
                .filter(tx => tx.type ? tx.type === 'Debit' : tx.category !== 'INCOME')
                .reduce((sum, tx) => sum + tx.amount, 0);
            } catch(e){}
          }
        }
      }
      
      return {
        id: s.id,
        name: mName,
        year: yearVal,
        monthIndex,
        spending: Math.round(spending)
      };
    });
    
    parsed.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
    
    return parsed;
  })();

  const TREND_DATA = dynamicTrendData.length > 0
    ? dynamicTrendData
    : [
        { name: 'May', spending: transactions.length > 0 ? 28000 : 0, color: '#e8dfee' },
        { name: 'Jun', spending: transactions.length > 0 ? 36000 : 0, color: '#e8dfee' },
        { name: 'Jul', spending: transactions.length > 0 ? 31000 : 0, color: '#e8dfee' },
        { name: 'Aug', spending: transactions.length > 0 ? 44000 : 0, color: '#e8dfee' },
        { name: 'Sep', spending: transactions.length > 0 ? 39000 : 0, color: '#e8dfee' },
        { name: 'Oct', spending: transactions.length > 0 ? Math.max(35000, totalSpent) : 0, color: '#7c3aed' },
      ];

  // Format currency helpers
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

  // Custom cell renderer to highlight the active/current month in trend chart
  const CustomBarShape = (props: any) => {
    const { fill, x, y, width, height, index, payload } = props;
    const isHighlighted = dynamicTrendData.length > 0
      ? index === dynamicTrendData.length - 1
      : payload?.name === 'Oct';
    const barColor = isHighlighted ? '#7c3aed' : '#b293e6';
    return (
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill={barColor} 
        rx={6} 
        ry={6} 
        className="transition-all duration-200 hover:opacity-90"
      />
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1280px] mx-auto" id="dashboard-tab-content">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="dashboard-header-container">
        <div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
            Good morning, {firstName} <span className="animate-pulse">👋</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-450 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            {(dynamicDate as any).sameMonthCount && (dynamicDate as any).sameMonthCount > 1 ? (
              <span>{dynamicDate.full} Analysis ({(dynamicDate as any).sameMonthCount} accounts)</span>
            ) : (
              <span>{dynamicDate.full} Analysis</span>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/upload')}
          id="header-upload-btn"
          className="bg-purple-50 hover:bg-purple-100/90 text-[#7c3aed] border border-purple-200/80 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 shrink-0 cursor-pointer shadow-sm shadow-purple-900/5 hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowUpRight className="w-4 h-4 text-[#7c3aed] stroke-[2.5]" />
          <span>Upload New Statement</span>
        </button>
      </div>

      {/* Onboarding Empty State banner / demo action triggers */}
      {transactions.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl" id="sandbox-onboarding-panel">
          {/* Accent light glows */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-[#7c3aed]/35 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10 max-w-xl text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#7c3aed]/20 border border-[#7c3aed]/40 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-450 shrink-0 animate-pulse" />
              <span>EMPTY SANDBOX DETECTED</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome to FinSight AI, {firstName}!</h2>
            <p className="text-xs text-slate-300 leading-normal">
              To activate your predictive models, automated transaction tags, and intelligence matrices, upload your first bank ledger PDF/CSV, or load our pre-configured sandbox demo profile to test drive the app.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={loadDemoData}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-205 cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-white text-purple-200" />
              <span>Load Sandbox Demo Profile</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="bg-slate-800 hover:bg-slate-755 border border-slate-705 text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-205 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Upload Your Bank Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-summary-grid">
        <MetricCard
          id="stat-spent"
          title="Total Spent"
          value={formatRupees(totalSpent)}
          trend="down"
          trendLabel={transactions.length > 0 ? "12% vs last month" : "No trend history"}
          icon={TrendingDown}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
        <MetricCard
          id="stat-saved"
          title="Saved This Month"
          value={formatRupees(savedThisMonth)}
          trend="up"
          trendLabel={transactions.length > 0 ? "8% vs last month" : "No trend history"}
          icon={PiggyBank}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MetricCard
          id="stat-category"
          title="Biggest Category"
          value={formattedBiggestCategory}
          trend="neutral"
          trendLabel={transactions.length > 0 ? `${formatRupees(biggestAmount)} spent total` : "Awaiting data Ingestion"}
          icon={Utensils}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MetricCard
          id="stat-transactions"
          title="Transactions"
          value={String(transactions.length)}
          trend="up"
          trendLabel={transactions.length > 0 ? `+${transactions.length} entries parsed` : "0 ledger rows"}
          icon={Layers}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
      </div>

      {/* Spending Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-grid">
        {/* Left Chart Card: Monthly trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.02)] flex flex-col justify-between h-[380px]" id="trend-chart-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Monthly Spending Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Historical breakdown over past 6 months</p>
            </div>
            <div className="text-xs bg-slate-50 text-slate-500 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 select-none">
              Last 6 months
            </div>
          </div>

          <div className="flex-1 w-full" id="trend-bar-chart-responsive">
            <ResponsiveContainer width="100%" height="95%">
              <BarChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${detectedCurrency}${val/1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${detectedCurrency}${value}`, 'Spending']} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="spending" 
                  shape={<CustomBarShape />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart Card: Category donut chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.02)] flex flex-col justify-between h-[380px]" id="category-chart-card">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Spending by Category</h2>
            <p className="text-xs text-slate-400 mt-0.5">Where your money went in {dynamicDate.month}</p>
          </div>

          <div className="flex items-center justify-center relative flex-1 h-[140px]" id="donut-pie-container">
            {/* Legend inside the Donut Chart */}
            <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">TOTAL</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5 animate-fade-in">
                {detectedCurrency === '₹' 
                  ? `${detectedCurrency}${(totalSpent/1000).toFixed(1)}k` 
                  : `${detectedCurrency}${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                }
              </span>
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={CATEGORY_CHART_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_CHART_DATA.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${detectedCurrency}${value}`, 'Category Total']} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* List Legends breakdown */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-slate-50 pt-4" id="category-labels-legend">
            {transactions.length > 0 ? (
              CATEGORY_CHART_DATA.map((cat: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-500 font-medium truncate">{cat.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{formatRupees(cat.value)}</span>
                </div>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic py-1 col-span-2 text-center">No active statement parsed yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Sparkles AI Suggestion Banner Card */}
      <div 
        id="sparkles-intelligence-card"
        className="relative overflow-hidden bg-gradient-to-r from-purple-900/5 via-violet-500/5 to-purple-600/5 border border-purple-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_12px_-3px_rgba(124,58,237,0.06)]"
      >
        <div className="flex items-start gap-4">
          <div className="bg-[#7c3aed] text-white p-3.5 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5.5 h-5.5 animate-spin-slow stroke-[2]" />
          </div>
          <div className="max-w-xl">
            <h3 className="font-bold text-base text-purple-950 font-sans tracking-tight">
              FinSight Intelligence Suggestion
            </h3>
            <p className="text-sm text-slate-655 mt-1 leading-relaxed">
              {transactions.length === 0 ? (
                "Predictive insights engine is awaiting financial ledger ingestion. Upload statement to receive customized, multi-category subscription recommendations immediately."
              ) : suggestionApplied 
                ? "Excellent! We have flagged the subscriptions and updated your monthly budget optimization plan." 
                : `Your subscriptions grew by 15% this month. We found 3 recurring payments to Netflix, Disney+, and Hulu. Consolidating or pausing one could save you ${detectedCurrency === '₹' ? '₹1,200' : detectedCurrency === '£' ? '£120' : '$120'} monthly.`
              }
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center bg-transparent">
          {transactions.length === 0 ? (
            <div className="text-xs font-mono font-bold text-slate-400 uppercase select-none">
              Awaiting data
            </div>
          ) : suggestionApplied ? (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 py-2.5 px-4 rounded-xl text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Applied Optimization</span>
            </div>
          ) : (
            <button
              onClick={() => setShowSubscriptionModal(true)}
              id="view-subs-cta-btn"
              className="w-full md:w-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-purple-950/10 cursor-pointer active:scale-[0.98]"
            >
              <span>View Subscriptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions List Ledger */}
      <div className="space-y-4" id="recent-transactions-ledger-section">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-805 tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit log of payments mapped by automated parsing</p>
          </div>
        </div>

        <TransactionTable 
          transactions={transactions} 
          limit={8} 
          showFilters={true} 
        />
      </div>

      {/* Subscription optimization modal/popup */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="subscription-modal">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-purple-100 text-[#7c3aed] p-2.5 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Manage Detected Subscriptions</h3>
                <p className="text-xs text-slate-500">Auto-identified from statement transaction mapping</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              We identified 3 active streaming and media subscriptions billing your account. You could consolidate they under family packages or freeze under-utilized memberships.
            </p>

            <div className="space-y-2.5 mb-6">
              {[
                { name: 'Netflix India', amount: detectedCurrency === '₹' ? 199 : 10, period: 'Monthly Single Screen', rec: `Upgrade to Shared Family Plan (Saves ${detectedCurrency === '₹' ? '₹147' : detectedCurrency === '£' ? '£10' : '$10'}/m)` },
                { name: 'Disney+ Hotstar Premier', amount: detectedCurrency === '₹' ? 299 : 15, period: 'Monthly Premium', rec: 'Pause during inactive travel seasons' },
                { name: 'Hulu AI Reader Pro', amount: detectedCurrency === '₹' ? 749 : 45, period: 'Monthly API Seat', rec: 'Underused in last 45 days. Consolidate seat.' },
              ].map((sub, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-150/45 transition-all">
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">{sub.name}</span>
                    <span className="text-[10px] text-purple-600 font-semibold block uppercase mt-0.5">{sub.rec}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block text-sm">{detectedCurrency}{sub.amount}</span>
                    <span className="text-[10px] text-slate-400 block">{sub.period}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 cursor-pointer"
              >
                Dismiss Analysis
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuggestionApplied(true);
                  setShowSubscriptionModal(false);
                }}
                className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer"
              >
                Apply Optimization
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
