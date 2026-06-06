/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, UploadedStatement, BudgetGoal, ChatThread, ChatMessage } from '../types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_STATEMENTS, 
  INITIAL_BUDGET_GOALS, 
  INITIAL_THREADS, 
  INITIAL_CHAT_MESSAGES 
} from '../data';

export function clearAllUserData() {
  const keysToKeep = ['users', 'currentUser', 'current_user'];
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    // Keep credentials (user account keys) to maintain signup databases
    if (key.startsWith('user_') && !key.includes('_data_')) {
      return;
    }
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
}

export interface User {
  name: string;
  email: string;
}

interface UserData {
  transactions: Transaction[];
  statements: UploadedStatement[];
  goals: BudgetGoal[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  transactions: Transaction[];
  statements: UploadedStatement[];
  goals: BudgetGoal[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  detectedCurrency: string;
  login: (email: string) => { success: boolean; error?: string };
  signup: (name: string, email: string) => { success: boolean; error?: string };
  logout: () => void;
  updateTransactions: (txs: Transaction[]) => void;
  updateStatements: (stmts: UploadedStatement[]) => void;
  updateGoals: (goalsList: BudgetGoal[]) => void;
  updateChatThreads: (threadsList: ChatThread[]) => void;
  updateChatMessages: (msgsList: ChatMessage[]) => void;
  loadDemoData: () => void;
  resetToCleanState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-user dynamic sandbox states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statements, setStatements] = useState<UploadedStatement[]>([]);
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [detectedCurrency, setDetectedCurrency] = useState<string>('₹');

  useEffect(() => {
    // Currency is always hardcoded to ₹ as per user request
  }, []);

  // Function to load data for a specific logged-in user
  const loadUserData = (email: string) => {
    const key = `user_data_${email.trim().toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserData;
        setTransactions(parsed.transactions || []);
        setStatements(parsed.statements || []);
        setGoals(parsed.goals || []);
        setChatThreads(parsed.chatThreads || []);
        setChatMessages(parsed.chatMessages || []);

        setDetectedCurrency('₹');
        localStorage.setItem('detected_currency', '₹');
      } catch (e) {
        console.error('Error parsing user data:', e);
        initializeEmptyUser();
      }
    } else {
      initializeEmptyUser();
    }
  };

  const initializeEmptyUser = () => {
    setTransactions([]);
    setStatements([]);
    setDetectedCurrency('₹');
    localStorage.setItem('detected_currency', '₹');
    
    // We can prepopulate 4 empty budget targets so their budget panels look ready to insert values
    const freshGoals: BudgetGoal[] = [
      { id: 'bg-fresh-1', category: 'FOOD & DINING', spent: 0, limit: 10000, color: 'bg-emerald-500' },
      { id: 'bg-fresh-2', category: 'TRANSPORT', spent: 0, limit: 5000, color: 'bg-[#7c3aed]' },
      { id: 'bg-fresh-3', category: 'ENTERTAINMENT', spent: 0, limit: 4000, color: 'bg-indigo-500' },
      { id: 'bg-fresh-4', category: 'HEALTHCARE', spent: 0, limit: 4000, color: 'bg-cyan-500' },
    ];
    setGoals(freshGoals);
    
    setChatThreads([
      { id: 'thread-wel', title: 'Welcome Assistant', timeLabel: 'Now', isActive: true }
    ]);
    
    setChatMessages([
      {
        id: 'msg-wel-1',
        sender: 'assistant',
        timestamp: 'Now',
        text: 'Hello! Welcome to your secure empty space on FinSight AI. Let\'s make your financial management intelligent. To begin, click the "Load Demo Dataset" card on the Dashboard to see how data-visuals render, or head directly over to the Upload Statement section and insert your raw bank ledger PDF/CSV!'
      }
    ]);
  };

  // Helper helper function to persist user data
  const saveUserData = (
    email: string,
    txs: Transaction[],
    stmts: UploadedStatement[],
    g: BudgetGoal[],
    threadsList: ChatThread[],
    msgsList: ChatMessage[]
  ) => {
    const key = `user_data_${email.trim().toLowerCase()}`;
    const payload: UserData = {
      transactions: txs,
      statements: stmts,
      goals: g,
      chatThreads: threadsList,
      chatMessages: msgsList,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  };

  // Safe wrapper setters
  const updateTransactions = (txs: Transaction[]) => {
    setTransactions(txs);
    setDetectedCurrency('₹');
    localStorage.setItem('detected_currency', '₹');
    if (user) {
      saveUserData(user.email, txs, statements, goals, chatThreads, chatMessages);
    }
  };

  const updateStatements = (stmts: UploadedStatement[]) => {
    setStatements(stmts);
    if (user) {
      saveUserData(user.email, transactions, stmts, goals, chatThreads, chatMessages);
    }
  };

  const updateGoals = (goalsList: BudgetGoal[]) => {
    setGoals(goalsList);
    if (user) {
      saveUserData(user.email, transactions, statements, goalsList, chatThreads, chatMessages);
    }
  };

  const updateChatThreads = (threadsList: ChatThread[]) => {
    setChatThreads(threadsList);
    if (user) {
      saveUserData(user.email, transactions, statements, goals, threadsList, chatMessages);
    }
  };

  const updateChatMessages = (msgsList: ChatMessage[]) => {
    setChatMessages(msgsList);
    if (user) {
      saveUserData(user.email, transactions, statements, goals, chatThreads, msgsList);
    }
  };

  const loadDemoData = () => {
    if (!user) return;
    
    // Welcome message tailored for current user name
    const firstName = user.name ? user.name.split(' ')[0] : 'Guest';
    const modifiedWelcomeChat: ChatMessage[] = [
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
        text: `In October, you overspent in 3 categories: **Food** (₹2,400 over budget), **Shopping** (₹1,100 over budget), and **Entertainment** (₹600 over budget).`,
        alert: {
          type: 'EXPENSE_ALERT',
          title: 'MAJOR EXPENSE ALERT',
          details: `Your biggest splurge was on Swiggy — 14 orders totaling ₹4,800.`,
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

    setTransactions(INITIAL_TRANSACTIONS);
    setStatements(INITIAL_STATEMENTS);
    setGoals(INITIAL_BUDGET_GOALS);
    setChatThreads(INITIAL_THREADS);
    setChatMessages(modifiedWelcomeChat);
    setDetectedCurrency('₹');
    localStorage.setItem('detected_currency', '₹');

    // Store demo datasets in localStorage under respective statement keys for swapping view
    localStorage.setItem(`statement_txs_${user.email.trim().toLowerCase()}_HDFC_Aug2023_Statement.pdf`, JSON.stringify(
      INITIAL_TRANSACTIONS.map(tx => ({ ...tx, date: tx.date.replace('Oct', 'Aug') }))
    ));
    localStorage.setItem(`statement_txs_${user.email.trim().toLowerCase()}_ICICI_Business_Q2.csv`, JSON.stringify(
      INITIAL_TRANSACTIONS.map(tx => ({ ...tx, date: tx.date.replace('Oct', 'Jun') }))
    ));
    localStorage.setItem(`statement_txs_${user.email.trim().toLowerCase()}_SBI_Savings_July.pdf`, JSON.stringify(
      INITIAL_TRANSACTIONS.map(tx => ({ ...tx, date: tx.date.replace('Oct', 'Jul') }))
    ));

    saveUserData(
      user.email,
      INITIAL_TRANSACTIONS,
      INITIAL_STATEMENTS,
      INITIAL_BUDGET_GOALS,
      INITIAL_THREADS,
      modifiedWelcomeChat
    );
  };

  const resetToCleanState = () => {
    if (!user) return;
    initializeEmptyUser();
    const key = `user_data_${user.email.trim().toLowerCase()}`;
    localStorage.removeItem(key);
    localStorage.removeItem('detected_currency');
    setDetectedCurrency('₹');
  };

  // Sync on mount or user changes
  useEffect(() => {
    try {
      const persistedUser = localStorage.getItem('current_user');
      if (persistedUser) {
        const u = JSON.parse(persistedUser) as User;
        setUser(u);
        loadUserData(u.email);
      }
    } catch (e) {
      console.error('Error reading current_user session from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string): { success: boolean; error?: string } => {
    try {
      const normalized = email.trim().toLowerCase();
      const userKey = `user_${normalized}`;
      const savedUserStr = localStorage.getItem(userKey);
      
      if (!savedUserStr) {
        return { success: false, error: 'Email address not found. Please sign up first!' };
      }

      const savedUser = JSON.parse(savedUserStr) as User;
      const sessionUser = { name: savedUser.name, email: savedUser.email };
      
      // Compare currentUser email with previously logged user email
      const previousUserStr = localStorage.getItem('current_user');
      if (previousUserStr) {
        try {
          const prevUser = JSON.parse(previousUserStr) as User;
          if (prevUser.email.trim().toLowerCase() !== sessionUser.email.trim().toLowerCase()) {
            clearAllUserData();
          }
        } catch (e) {
          clearAllUserData();
        }
      }
      
      localStorage.setItem('current_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      
      // Load user data sandbox
      loadUserData(sessionUser.email);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Login verification failed due to internal error.' };
    }
  };

  const signup = (name: string, email: string): { success: boolean; error?: string } => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userKey = `user_${normalizedEmail}`;
      const savedUserStr = localStorage.getItem(userKey);

      if (savedUserStr) {
        return { success: false, error: 'An account with this email already exists!' };
      }

      const newUser: User = {
        name: name.trim(),
        email: normalizedEmail,
      };

      // Store credentials & profile
      localStorage.setItem(userKey, JSON.stringify(newUser));
      
      // Clear all cached files and generic metrics for raw transaction/statements
      clearAllUserData();
      
      // Auto login
      localStorage.setItem('current_user', JSON.stringify(newUser));
      setUser(newUser);

      // Setup clean slate initial empty schema
      setTransactions([]);
      setStatements([]);
      const freshGoals = [
        { id: 'bg-fresh-1', category: 'FOOD & DINING', spent: 0, limit: 10000, color: 'bg-emerald-500' },
        { id: 'bg-fresh-2', category: 'TRANSPORT', spent: 0, limit: 5000, color: 'bg-[#7c3aed]' },
        { id: 'bg-fresh-3', category: 'ENTERTAINMENT', spent: 0, limit: 4000, color: 'bg-indigo-500' },
        { id: 'bg-fresh-4', category: 'HEALTHCARE', spent: 0, limit: 4000, color: 'bg-cyan-500' },
      ];
      setGoals(freshGoals);
      setChatThreads([{ id: 'thread-wel', title: 'Welcome Assistant', timeLabel: 'Now', isActive: true }]);
      setChatMessages([
        {
          id: 'msg-wel-1',
          sender: 'assistant',
          timestamp: 'Now',
          text: 'Hello! Welcome to your secure empty space on FinSight AI. Let\'s make your financial management intelligent. To begin, click the "Load Demo Dataset" card on the Dashboard to see how data-visuals render, or head directly over to the Upload Statement section and insert your raw bank ledger PDF/CSV!'
        }
      ]);

      saveUserData(
        newUser.email,
        [],
        [],
        freshGoals,
        [{ id: 'thread-wel', title: 'Welcome Assistant', timeLabel: 'Now', isActive: true }],
        [
          {
            id: 'msg-wel-1',
            sender: 'assistant',
            timestamp: 'Now',
            text: 'Hello! Welcome to your secure empty space on FinSight AI. Let\'s make your financial management intelligent. To begin, click the "Load Demo Dataset" card on the Dashboard to see how data-visuals render, or head directly over to the Upload Statement section and insert your raw bank ledger PDF/CSV!'
          }
        ]
      );

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to create account due to internal error.' };
    }
  };

  const logout = () => {
    clearAllUserData();
    localStorage.removeItem('current_user');
    localStorage.removeItem('detected_currency');
    setUser(null);
    setTransactions([]);
    setStatements([]);
    setGoals([]);
    setChatThreads([]);
    setChatMessages([]);
    setDetectedCurrency('₹');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      transactions, 
      statements, 
      goals, 
      chatThreads, 
      chatMessages, 
      detectedCurrency,
      login, 
      signup, 
      logout,
      updateTransactions,
      updateStatements,
      updateGoals,
      updateChatThreads,
      updateChatMessages,
      loadDemoData,
      resetToCleanState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
