/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';
import { 
  ShoppingBag, 
  Utensils, 
  CreditCard, 
  Zap, 
  Clapperboard, 
  Car, 
  HeartPulse,
  Home,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
  showFilters?: boolean;
}

// Category Configuration Map for Badges, Icons and Coloring
const CATEGORY_MAP = {
  SHOPPING: {
    label: 'SHOPPING',
    icon: ShoppingBag,
    colorClasses: 'bg-blue-50 text-blue-600 border border-blue-100/50',
    iconContainer: 'bg-blue-50 text-blue-600'
  },
  FOOD: {
    label: 'FOOD',
    icon: Utensils,
    colorClasses: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    iconContainer: 'bg-amber-50 text-amber-600'
  },
  INCOME: {
    label: 'INCOME',
    icon: CreditCard,
    colorClasses: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    iconContainer: 'bg-emerald-50 text-emerald-600'
  },
  UTILITIES: {
    label: 'UTILITIES',
    icon: Zap,
    colorClasses: 'bg-indigo-50 text-indigo-600 border border-indigo-150/45',
    iconContainer: 'bg-indigo-50 text-indigo-600'
  },
  ENTERTAINMENT: {
    label: 'ENTERTAINMENT',
    icon: Clapperboard,
    colorClasses: 'bg-purple-50 text-purple-600 border border-purple-100/50',
    iconContainer: 'bg-purple-50 text-purple-600'
  },
  TRANSPORT: {
    label: 'TRANSPORT',
    icon: Car,
    colorClasses: 'bg-sky-50 text-sky-600 border border-sky-100/50',
    iconContainer: 'bg-sky-50 text-sky-600'
  },
  HEALTHCARE: {
    label: 'HEALTHCARE',
    icon: HeartPulse,
    colorClasses: 'bg-rose-50 text-rose-600 border border-rose-100/50',
    iconContainer: 'bg-rose-50 text-rose-600'
  },
  HOUSING: {
    label: 'HOUSING',
    icon: Home,
    colorClasses: 'bg-purple-50 text-purple-600 border border-purple-100/50',
    iconContainer: 'bg-purple-50 text-purple-600'
  },
  OTHERS: {
    label: 'OTHERS',
    icon: CreditCard,
    colorClasses: 'bg-slate-50 text-slate-600 border border-slate-100/50',
    iconContainer: 'bg-slate-50 text-slate-600'
  }
};

export default function TransactionTable({ 
  transactions, 
  limit, 
  showFilters = true 
}: TransactionTableProps) {
  const { detectedCurrency } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Handlers for exporting or downloading statement data logic
  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Status'];
    const rows = filteredTransactions.map(tx => [tx.date, tx.merchant, tx.category, tx.amount, tx.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinSight_Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform search & filters on transactions memoized
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Sort transactions by date (newest first)
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA;
      }
      return b.date.localeCompare(a.date);
    });

    if (searchTerm.trim() !== '') {
      result = result.filter(tx => 
        tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter(tx => tx.category === selectedCategory);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter(tx => tx.status === selectedStatus);
    }

    return result;
  }, [transactions, searchTerm, selectedCategory, selectedStatus]);

  // Handle pagination limits
  const paginatedTransactions = useMemo(() => {
    if (limit && limit > 0) {
      return filteredTransactions.slice(0, limit);
    }
    return filteredTransactions;
  }, [filteredTransactions, limit]);

  // Format currency helper
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
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_4px_6px_-1px_rgb(0,0,0,0.02)]" id="recent-transactions-container">
      
      {/* Search and Filters Section */}
      {showFilters && (
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="transaction-filters-panel">
          
          {/* Left search bar */}
          <div className="relative flex-1 max-w-sm" id="search-bar-wrapper">
            <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search merchants or orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="transaction-search-input"
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#7c3aed] focus:bg-white focus:ring-2 focus:ring-[#7c3aed]/10 placeholder-slate-400 text-sm py-2.5 pl-11 pr-4 rounded-xl outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right dropdown filters */}
          <div className="flex flex-wrap items-center gap-2.5" id="transaction-dropdowns-wrapper">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                id="filter-category-select"
                className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 pl-4 pr-9 text-sm text-slate-700 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#7c3aed]/10 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="SHOPPING">Shopping</option>
                <option value="FOOD">Food</option>
                <option value="INCOME">Income</option>
                <option value="UTILITIES">Utilities</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="TRANSPORT">Transport</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="HOUSING">Housing</option>
                <option value="OTHERS">Others</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                id="filter-status-select"
                className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 pl-4 pr-9 text-sm text-slate-700 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#7c3aed]/10 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              id="export-csv-btn"
              title="Download Statement (CSV)"
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 sm:w-auto hover:bg-slate-100 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Transaction Table Grid */}
      <div className="overflow-x-auto w-full">
        {paginatedTransactions.length > 0 ? (
          <table className="w-full text-left border-collapse" id="main-transactions-table-element">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 font-mono uppercase">
                <th className="py-4.5 px-6 select-none">Date</th>
                <th className="py-4.5 px-6 select-none">Description</th>
                <th className="py-4.5 px-6 select-none">Category</th>
                <th className="py-4.5 px-6 select-none text-right">Amount</th>
                <th className="py-4.5 px-6 select-none">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-sans">
              {paginatedTransactions.map((tx) => {
                const mapInfo = CATEGORY_MAP[tx.category] || {
                  label: tx.category,
                  icon: ShoppingBag,
                  colorClasses: 'bg-slate-50 text-slate-600 border border-slate-100',
                  iconContainer: 'bg-slate-50 text-slate-600'
                };
                const CatIcon = mapInfo.icon;

                return (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-slate-50/50 transition-colors duration-150 cursor-default align-middle"
                    id={`tx-row-${tx.id}`}
                  >
                    {/* Column 1: Date */}
                    <td className="py-4.5 px-6 text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Column 2: Merchant */}
                    <td className="py-4.5 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${mapInfo.iconContainer}`}>
                          <CatIcon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-800 leading-tight">{tx.merchant}</span>
                          {tx.description && (
                            <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">{tx.description}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Category Badge */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full tracking-wide ${mapInfo.colorClasses}`}>
                        {mapInfo.label}
                      </span>
                    </td>

                    {/* Column 4: Rupee Amount */}
                    <td className={`py-4.5 px-6 text-right whitespace-nowrap font-mono font-bold tracking-tight text-base tabular-nums
                      ${tx.category === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}
                    >
                      {tx.category === 'INCOME' ? '+' : '-'}{formatRupees(tx.amount)}
                    </td>

                    {/* Column 5: Status Badge */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        {tx.status === 'Completed' ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-500">{tx.status}</span>
                          </>
                        ) : tx.status === 'Pending' ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-slate-500">{tx.status}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span className="text-slate-500">{tx.status}</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-400" id="no-transactions-placeholder">
            <Filter className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 mb-1">No transactions found</p>
            <p className="text-xs">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
