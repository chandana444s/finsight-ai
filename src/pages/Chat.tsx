/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, 
  Search, 
  Sparkles, 
  Send, 
  Paperclip, 
  LineChart, 
  MoreVertical, 
  Share2, 
  Utensils, 
  Flame, 
  ArrowUpRight,
  TrendingUp, 
  Info,
  CheckCircle,
  FileText,
  User,
  Check,
  Bot,
  Lock
} from 'lucide-react';
import { ChatThread, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const navigate = useNavigate();
  const { user, chatThreads, updateChatThreads, chatMessages, updateChatMessages, transactions, detectedCurrency } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';
  
  const [threads, setThreads] = useState<ChatThread[]>(chatThreads);
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState(() => chatThreads[0]?.id || 'thread-wel');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state with global authentication context profile updates
  useEffect(() => {
    setThreads(chatThreads);
  }, [chatThreads]);

  useEffect(() => {
    setMessages(chatMessages);
  }, [chatMessages]);

  const syncThreads = (newThreads: ChatThread[]) => {
    setThreads(newThreads);
    updateChatThreads(newThreads);
  };

  const syncMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    updateChatMessages(newMessages);
  };

  // Auto-scroll chat to bottom when message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle clicking custom embedded action chips inside the AI bubble
  const handleActionClick = (actionId: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let actions: Array<{ id: string, label: string }> = [];

      if (actionId === 'action-budget') {
        replyText = "I've drafted a strict dining ceiling of **₹8,000** for next month. Would you like me to lock this in and send an SMS alert if you breach 75% of your limit?";
        actions = [{ id: 'confirm-budget', label: 'Lock budget at ₹8,000' }];
      } else if (actionId === 'action-subs') {
        replyText = "Your 3 active streaming accounts (Netflix, Disney+, Hulu Pro) are billing ₹1,247 monthly. I highly recommend merging Netflix under a family seat or freezing Hulu Pro which has zero logs in the last 45 days. Shall I draft opt-out emails for any of these?";
        actions = [{ id: 'confirm-subs', label: 'Draft cancellation draft' }];
      } else if (actionId === 'confirm-budget') {
        replyText = "✅ Understood. Budget limit updated in your Dashboard metrics. Cell warnings locked at ₹8,000.";
      } else {
        replyText = "Draft ready for your review: 'Dear Support, I would like to request immediate service suspension for Seat Oct-05...' Ready to send!";
      }

      const aiReply: ChatMessage = {
        id: `msg-rep-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        actions: actions
      };
      syncMessages([...messages, aiReply]);
    }, 1200);
  };

  // Submit custom textual question to the AI Agent
  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const userText = inputMessage;
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    setMessages(current => {
      const updated = [...current, userMsg];
      updateChatMessages(updated);
      return updated;
    });
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic AI analysis reply after delay
    setTimeout(() => {
      setIsTyping(false);
      let aiText = '';
      let alertObj: any = undefined;
      const lowerText = userText.toLowerCase();

      if (lowerText.includes('save') || lowerText.includes('saving')) {
        aiText = "Based on our parsing, your core savings rate is **21.6%**, which is highly stable! You can increase this towards 25% by cutting variable convenience fees on food orders. I recommend checking your utility trends.";
      } else if (lowerText.includes('rent') || lowerText.includes('utility') || lowerText.includes('electric')) {
        aiText = "Your Rent & Utilities cost ₹24,000, fixed on the 10th of every month. I noticed a ₹3,200 pending invoice for Tata Power which is due tomorrow. Would you like me to flag this as verified?";
        alertObj = {
          type: 'TIPS',
          title: 'PENDING UTILITY PAYMENT DUE',
          details: 'Tata Power utilities bills amounting to ₹3,200 due in 24 hours.',
          amount: 3200,
          icon: 'Utilities'
        };
      } else if (lowerText.includes('swiggy') || lowerText.includes('food') || lowerText.includes('eat')) {
        aiText = "Swiggy represents **9% of your total expenditures** (₹4,800 spent across October). Most splurges occur during dinner convenience delivery windows of 8 PM - 10 PM on Week 3.";
      } else {
        const sym = window.currentCurrency || detectedCurrency || '₹';
        const validTxs = transactions.filter(t => t.amount <= 99999 && (t.type ? t.type === 'Debit' : t.category !== 'INCOME'));
        const total = validTxs.reduce((a, b) => a + b.amount, 0);
        const outflowText = transactions.length > 0 ? sym + total.toLocaleString('en-IN') : sym + "45,200";
        aiText = `I've scanned your statement metadata. We successfully parsed ${transactions.length > 0 ? transactions.length : "sample"} active line items totaling ${outflowText} of outflow. How else can I help fine-tune your financial metrics?`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        text: aiText,
        alert: alertObj
      };

      setMessages(current => {
        const updated = [...current, aiMsg];
        updateChatMessages(updated);
        return updated;
      });
    }, 1500);
  };

  // Shortcut Pill: Create graph
  const handleSuggestGraph = () => {
    const userMsg: ChatMessage = {
      id: `msg-user-g-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      text: "Can you chart my spending structure?"
    };

    setMessages(current => {
      const updated = [...current, userMsg];
      updateChatMessages(updated);
      return updated;
    });
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: ChatMessage = {
        id: `msg-ai-g-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        text: "Here is your customized October category breakdown. Food comprises the single largest variable section at 28.3%:",
        alert: {
          type: 'TIPS',
          title: 'OCTOBER VARIABLE BUDGET BREAKDOWN',
          details: '🍲 Food (28.3% @ ₹12.8k) | 🛍️ Shopping (15.9% @ ₹7.2k) | 🚗 Transport (14.1% @ ₹6.4k)...',
          icon: 'Graph'
        }
      };
      setMessages(current => {
        const updated = [...current, aiMsg];
        updateChatMessages(updated);
        return updated;
      });
    }, 1200);
  };

  // Filter threads based on user search query
  const filteredThreads = threads.filter(tr => 
    tr.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen w-full overflow-hidden bg-slate-50" id="chat-workspace-layer">
      
      {/* LEFT COLUMN: Chat History Sidebar Panel */}
      <div className="w-[300px] border-r border-slate-200 bg-white flex flex-col justify-between hidden sm:flex shrink-0" id="chat-history-sidebar">
        
        {/* Sidebar Header elements */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-800 tracking-tight">Chat History</h2>
            <button
              onClick={() => {
                const welcomeMsg: ChatMessage = {
                  id: 'msg-brand-new-' + Date.now(),
                  sender: 'assistant',
                  timestamp: 'Now',
                  text: `Welcome ${firstName}! I've loaded your parsed ledger overview. Ping me to analyze overspends, utilities, or recurring streaming invoices!`
                };
                syncMessages([welcomeMsg]);
                const newTitle = `Custom Query ${threads.length + 1}`;
                const nextThreads = [{ id: `thr-${Date.now()}`, title: newTitle, timeLabel: 'Just Now', isActive: true }, ...threads.map(t => ({...t, isActive: false}))];
                syncThreads(nextThreads);
              }}
              id="new-chat-pane-btn"
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-[#7c3aed] border border-slate-200 hover:border-purple-200 rounded-lg transition-all cursor-pointer"
              title="Start New Thread Conversation"
            >
              <PlusSquare className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Search bar helper */}
          <div className="relative" id="history-search-wrapper">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#7c3aed] focus:bg-white placeholder-slate-400 text-xs py-2 pl-9 pr-3 rounded-lg outline-none transition duration-200"
            />
          </div>
        </div>

        {/* Scrollable list of previous threads */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1" id="history-scroller">
          {filteredThreads.slice(0, 10).map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                setActiveThreadId(thread.id);
                const nextThreads = threads.map(t => ({ ...t, isActive: t.id === thread.id }));
                syncThreads(nextThreads);
                // Mock change responses content per thread to make it super interactive
                if (thread.id === 'thread-1') {
                  syncMessages(chatMessages);
                } else {
                  syncMessages([
                    {
                      id: `msg-custom-${thread.id}`,
                      sender: 'user',
                      timestamp: 'Oct 2023',
                      text: `Draft question context: ${thread.title}`
                    },
                    {
                      id: `msg-custom-ai-${thread.id}`,
                      sender: 'assistant',
                      timestamp: 'Oct 2023',
                      text: `This is a saved thread conversation detail concerning *${thread.title}*. I scanned historical logs for this transaction series. Do you wish to re-evaluate potential billing optimization plans or download a CSV report?`
                    }
                  ]);
                }
              }}
              id={`thread-button-${thread.id}`}
              className={`w-full text-left p-3 rounded-xl transition duration-200 outline-none block group relative cursor-pointer
                ${thread.isActive 
                  ? 'bg-purple-50 text-[#7c3aed] border border-purple-100/50 font-semibold' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-transparent'
                }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs truncate block pr-2 font-medium">{thread.title}</span>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono font-medium">{thread.timeLabel}</span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate mt-0.5 mt-1 leading-normal font-normal">
                {thread.id === 'thread-1' ? 'October Spending Analysis' : 'Archived conversation details log'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer profile tag */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70" id="chat-sidebar-trust-footer">
          <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider select-none">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Encrypted AI Assistant</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CHAT STREAM INTERFACE */}
      <div className="flex-1 flex flex-col justify-between bg-white h-full relative" id="chat-stream-window">
        
        {/* Chat header panel */}
        <div className="border-b border-slate-100 p-4 flex items-center justify-between" id="chat-window-header">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold relative">
              <Bot className="w-5 h-5 text-[#7c3aed]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-805 block">FinSight AI Agent</span>
              <span className="text-[10px] text-emerald-500 font-bold block mt-0.5 uppercase tracking-wide">● Active Analysis Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-1" id="chat-header-actions-wrapper">
            <button 
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer"
              title="Share Insights Analysis"
              onClick={() => alert("Simulation: Report shared with team.")}
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-505 more-vertical text-slate-500 cursor-pointer">
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Message streams bubble area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" id="messages-stream-list">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%]
                  ${isAI ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
                id={`message-bubble-${msg.id}`}
              >
                {/* Avatar Icon */}
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center shrink-0 border border-purple-100/50 shadow-sm">
                    <Sparkles className="w-4.5 h-4.5 text-[#7c3aed] shrink-0" />
                  </div>
                )}

                <div className="space-y-2.5">
                  {/* Bubble Container */}
                  <div 
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${isAI 
                        ? 'bg-slate-50 border border-slate-205/65 text-slate-800 font-medium' 
                        : 'bg-[#7c3aed] text-white font-medium shadow-md shadow-purple-900/10'
                      }`}
                  >
                    {/* Render message formatting support tags */}
                    <div className="font-sans whitespace-pre-wrap">
                      {msg.text.split('**').map((tok, i) => i % 2 === 1 ? <strong key={i} className={isAI ? "text-[#7c3aed] font-bold" : "font-extrabold text-white"}>{tok}</strong> : tok)}
                    </div>
                  </div>

                  {/* Embedded Rich Card Alerts */}
                  {msg.alert && (
                    <div 
                      className={`rounded-2xl p-3 border flex items-start gap-2.5 max-w-sm shadow-sm
                        ${msg.alert.type === 'EXPENSE_ALERT' 
                          ? 'bg-rose-50/70 border-rose-100/80 text-slate-805' 
                          : 'bg-[#7c3aed]/5 border-[#7c3aed]/10 text-slate-805'}`}
                      id="message-alert-attachment"
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow-sm text-white
                        ${msg.alert.type === 'EXPENSE_ALERT' ? 'bg-rose-500' : 'bg-[#7c3aed]'}`}
                      >
                        {msg.alert.icon === 'Swiggy' ? (
                          <Utensils className="w-4 h-4" />
                        ) : msg.alert.icon === 'Utilities' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <LineChart className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-extrabold tracking-wider font-mono text-slate-400 uppercase block">
                          {msg.alert.title}
                        </span>
                        <span className="font-bold text-xs text-slate-800 block leading-tight">
                          {msg.alert.details}
                        </span>
                        {msg.alert.amount && (
                          <span className="font-mono font-bold text-[#7c3aed] text-sm block mt-0.5">
                            ₹{msg.alert.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bubble Action Chip Hooks */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1" id="message-action-chips">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => handleActionClick(act.id)}
                          className="text-xs bg-white hover:bg-purple-100/80 hover:text-[#7c3aed] border border-purple-100 hover:border-purple-200/90 text-purple-700 font-bold py-2 p-3.5 rounded-xl transition duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp metadata */}
                  <span className={`text-[10px] text-slate-400 font-mono font-medium block px-1 
                    ${isAI ? 'text-left' : 'text-right'}`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator state */}
          {isTyping && (
            <div className="flex gap-3 mr-auto items-center" id="typing-indicator-state">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center shrink-0 border border-purple-100/50">
                <Bot className="w-4.5 h-4.5 animate-bounce text-[#7c3aed]" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form dialogue bar */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3" id="chat-input-controls-panel">
          {/* Helper items shortcuts above text area */}
          <div className="flex flex-wrap items-center gap-2 px-1 text-xs" id="help-pills-row">
            <button
              onClick={() => navigate('/upload')}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Statement</span>
            </button>
            <button
              onClick={handleSuggestGraph}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <LineChart className="w-3.5 h-3.5 text-slate-500" />
              <span>Generate Graph</span>
            </button>
          </div>

          {/* Form component */}
          <form onSubmit={handleSubmitMessage} className="flex gap-2" id="chat-input-form">
            <input
              type="text"
              placeholder="Ask anything about your finances or custom billing optimizations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              id="chat-command-text-field"
              className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#7c3aed] focus:bg-white focus:ring-2 focus:ring-[#7c3aed]/10 placeholder-slate-400 text-sm py-3 px-4 rounded-xl outline-none transition duration-200"
            />
            
            <button
              type="submit"
              disabled={inputMessage.trim() === ''}
              id="submit-query-btn"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-xl transition duration-200 shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Disclaimer details */}
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1.5 pt-0.5">
            <span>Powered by GPT-4o</span>
            <span>FinSight AI may make mistakes. Verify important values.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
