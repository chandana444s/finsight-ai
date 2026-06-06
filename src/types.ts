/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: 'SHOPPING' | 'FOOD' | 'INCOME' | 'UTILITIES' | 'ENTERTAINMENT' | 'TRANSPORT' | 'HEALTHCARE' | 'HOUSING' | 'OTHERS';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  description?: string;
  currencySymbol?: string;
  type?: 'Debit' | 'Credit';
}

declare global {
  interface Window {
    currentCurrency?: string;
  }
}

export interface MetricData {
  title: string;
  value: string;
  subtext: string;
  isPositive: boolean;
  type: 'currency' | 'number' | 'text';
  iconName: string;
}

export interface UploadedStatement {
  id: string;
  filename: string;
  dateUploaded: string;
  transactionsCount: number;
  status: 'Processing' | 'Processed' | 'Failed';
  detectedMonth?: string;
  detectedYear?: number;
  fileTotal?: number;
}

export interface BudgetGoal {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export interface ChatThread {
  id: string;
  title: string;
  timeLabel: string;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  alert?: {
    type: 'EXPENSE_ALERT' | 'TIPS';
    title: string;
    details: string;
    amount?: number;
    icon?: string;
  };
  actions?: Array<{
    id: string;
    label: string;
  }>;
}
