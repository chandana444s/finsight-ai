/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, UploadedStatement, BudgetGoal, ChatThread, ChatMessage } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: 'Oct 24, 2023',
    merchant: 'Amazon India',
    category: 'SHOPPING',
    amount: 2499.00,
    status: 'Completed',
    description: 'Electronics & Office'
  },
  {
    id: 'tx-2',
    date: 'Oct 23, 2023',
    merchant: 'Swiggy',
    category: 'FOOD',
    amount: 450.00,
    status: 'Completed',
    description: 'Lunch Order'
  },
  {
    id: 'tx-3',
    date: 'Oct 22, 2023',
    merchant: 'Salary Credit',
    category: 'INCOME',
    amount: 95000.00,
    status: 'Completed',
    description: 'TCS Ltd'
  },
  {
    id: 'tx-4',
    date: 'Oct 21, 2023',
    merchant: 'Tata Power',
    category: 'UTILITIES',
    amount: 3200.00,
    status: 'Pending',
    description: 'Utilities'
  },
  {
    id: 'tx-5',
    date: 'Oct 20, 2023',
    merchant: 'Netflix India',
    category: 'ENTERTAINMENT',
    amount: 199.00,
    status: 'Completed',
    description: 'Monthly Premium Single Screen'
  },
  {
    id: 'tx-6',
    date: 'Oct 19, 2023',
    merchant: 'Zomato',
    category: 'FOOD',
    amount: 1200.00,
    status: 'Completed',
    description: 'Dinner Splurge'
  },
  {
    id: 'tx-7',
    date: 'Oct 18, 2023',
    merchant: 'Uber India',
    category: 'TRANSPORT',
    amount: 850.00,
    status: 'Completed',
    description: 'Airport Ride'
  },
  {
    id: 'tx-8',
    date: 'Oct 15, 2023',
    merchant: 'Apollo Pharmacy',
    category: 'HEALTHCARE',
    amount: 1540.00,
    status: 'Completed',
    description: 'Regular Prescription Medicines'
  },
  {
    id: 'tx-9',
    date: 'Oct 12, 2023',
    merchant: 'Swiggy',
    category: 'FOOD',
    amount: 850.00,
    status: 'Completed',
    description: 'Office Dinner Party'
  },
  {
    id: 'tx-10',
    date: 'Oct 10, 2523',
    merchant: 'HDFC Bank Rent',
    category: 'UTILITIES',
    amount: 24000.00,
    status: 'Completed',
    description: 'Apartment Monthly Rent Transfer'
  },
  {
    id: 'tx-11',
    date: 'Oct 05, 2023',
    merchant: 'Disney+ Hotstar',
    category: 'ENTERTAINMENT',
    amount: 299.00,
    status: 'Completed',
    description: 'AI Subscription Match'
  },
  {
    id: 'tx-12',
    date: 'Sep 28, 2023',
    merchant: 'Zomato Food',
    category: 'FOOD',
    amount: 1850.00,
    status: 'Completed',
    description: 'Weekend Dining Party'
  },
  {
    id: 'tx-13',
    date: 'Sep 25, 2023',
    merchant: 'Amazon India',
    category: 'SHOPPING',
    amount: 4800.00,
    status: 'Completed',
    description: 'Clothing & Apparel'
  },
  {
    id: 'tx-14',
    date: 'Sep 20, 2023',
    merchant: 'Swiggy',
    category: 'FOOD',
    amount: 1500.00,
    status: 'Completed',
    description: 'Food Order'
  },
  {
    id: 'tx-15',
    date: 'Sep 10, 2023',
    merchant: 'HDFC Bank Rent',
    category: 'UTILITIES',
    amount: 24000.00,
    status: 'Completed',
    description: 'Apartment Rent'
  },
  {
    id: 'tx-16',
    date: 'Aug 24, 2023',
    merchant: 'Flipkart',
    category: 'SHOPPING',
    amount: 3200.00,
    status: 'Completed',
    description: 'Home Utilities'
  },
  {
    id: 'tx-17',
    date: 'Aug 10, 2023',
    merchant: 'HDFC Bank Rent',
    category: 'UTILITIES',
    amount: 24000.00,
    status: 'Completed',
    description: 'Apartment Rent'
  },
  {
    id: 'tx-18',
    date: 'Jul 15, 2023',
    merchant: 'Uber India',
    category: 'TRANSPORT',
    amount: 450.05,
    status: 'Completed',
    description: 'City Ride'
  }
];

export const INITIAL_STATEMENTS: UploadedStatement[] = [
  {
    id: 'stmt-1',
    filename: 'HDFC_Aug2023_Statement.pdf',
    dateUploaded: 'Sep 01, 2023',
    transactionsCount: 156,
    status: 'Processed'
  },
  {
    id: 'stmt-2',
    filename: 'ICICI_Business_Q2.csv',
    dateUploaded: 'Aug 15, 2023',
    transactionsCount: 842,
    status: 'Processed'
  },
  {
    id: 'stmt-3',
    filename: 'SBI_Savings_July.pdf',
    dateUploaded: 'Aug 02, 2023',
    transactionsCount: 45,
    status: 'Processed'
  }
];

export const INITIAL_BUDGET_GOALS: BudgetGoal[] = [
  {
    id: 'bg-1',
    category: 'FOOD & DINING',
    spent: 8400,
    limit: 10000,
    color: 'bg-red-500'
  },
  {
    id: 'bg-2',
    category: 'TRANSPORT',
    spent: 3200,
    limit: 5000,
    color: 'bg-[#7c3aed]'
  },
  {
    id: 'bg-3',
    category: 'ENTERTAINMENT',
    spent: 1500,
    limit: 4000,
    color: 'bg-emerald-500'
  },
  {
    id: 'bg-4',
    category: 'HEALTHCARE',
    spent: 4200,
    limit: 4000,
    color: 'bg-rose-500'
  }
];

export const INITIAL_THREADS: ChatThread[] = [
  { id: 'thread-1', title: 'Current Chat', timeLabel: '2m ago', isActive: true },
  { id: 'thread-2', title: 'Budget for Goa trip', timeLabel: 'Yesterday' },
  { id: 'thread-3', title: 'HDFC Credit Card Interest', timeLabel: 'Oct 24' },
  { id: 'thread-4', title: 'Rental increase projection', timeLabel: 'Oct 22' },
  { id: 'thread-5', title: 'Tax saving investments', timeLabel: 'Oct 18' }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '10:42 AM',
    text: 'Where did I overspend last month?'
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    timestamp: '10:42 AM',
    text: 'In October, you overspent in 3 categories: **Food** (₹2,400 over budget), **Shopping** (₹1,100 over budget), and **Entertainment** (₹600 over budget).',
    alert: {
      type: 'EXPENSE_ALERT',
      title: 'MAJOR EXPENSE ALERT',
      details: 'Your biggest splurge was on Swiggy — 14 orders totaling ₹4,800.',
      amount: 4800,
      icon: 'Swiggy'
    },
    actions: [
      { id: 'action-budget', label: 'Set Food Budget' },
      { id: 'action-subs', label: 'Analyze Subscriptions' }
    ]
  },
  {
    id: 'msg-3',
    sender: 'user',
    timestamp: '10:43 AM',
    text: 'How can I optimize my subscription payments?'
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    timestamp: '10:44 AM',
    text: 'You currently have multiple recurring streaming invoices. Consolidating your **Netflix India** account into a single family subscription would save **₹147 per month** automatically. Click "Analyze Subscriptions" in the alert above to review options.'
  },
  {
    id: 'msg-5',
    sender: 'user',
    timestamp: '10:45 AM',
    text: 'Are my regular utility payments set for this week?'
  },
  {
    id: 'msg-6',
    sender: 'assistant',
    timestamp: '10:45 AM',
    text: 'Yes! Your upcoming **Tata Power** utility payment of **₹3,200** is detected and pending. All other regular utilities remain well within historical standard deviation levels.'
  }
];

// Helper to sum categories from transactions
export const getCategoryTotal = (category: string) => {
  return INITIAL_TRANSACTIONS
    .filter(tx => tx.category === category)
    .reduce((sum, tx) => sum + tx.amount, 0);
};
