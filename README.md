# FinSight AI 💰
### AI-Powered Personal Finance Tracker for Indian Bank Statements

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=flat-square&logo=tailwindcss)
![PDFjs](https://img.shields.io/badge/PDF.js-Parser-red?style=flat-square)
![Tesseract](https://img.shields.io/badge/Tesseract.js-OCR-orange?style=flat-square)

---

## 🔗 Live Demo
**[https://finsight-ai-463582276521.asia-southeast1.run.app](https://finsight-ai-463582276521.asia-southeast1.run.app)**

> Sign up with any name and email to explore all features.
> Test files: Upload any Indian bank statement as CSV, PDF, or photo.

---

## ✨ Features

### 🔐 Authentication
- Signup with full name, email, password (min 6 characters)
- Login with persistent session via localStorage
- Dynamic greeting — "Good morning, Chandana" using real logged-in name
- Protected routes — unauthenticated users auto-redirected to /login
- Logout clears ALL financial data — next user starts completely fresh

### 📁 Multi-Format Statement Upload
| Format | How it works |
|--------|-------------|
| CSV (.csv) | Direct column parsing — supports HDFC, Axis, SBI, ICICI formats |
| PDF (.pdf) | PDF.js text extraction + Indian date pattern detection |
| Image (.jpg/.png) | Tesseract.js OCR converts image to text, then parsed |

- Auto-detects CSV column format (simple format vs bank export format)
- Supports DD/MM/YYYY, DD-MM-YYYY, DD Mon YY date formats
- Duplicate file detection — warns before overwriting
- Same-month duplicate — offers Replace, Merge, or Cancel
- Upload history with per-file delete and "Clear All"

### 📊 Multi-Statement Dashboard
- Upload multiple monthly statements — all data combined automatically
- Same month, different banks → Merge both into one month
- Different months → each becomes a separate bar in the trend chart
- 4 metric cards: Total Spent, Saved This Month, Biggest Category, Transactions
- Monthly Spending Trend — bar chart with one bar per uploaded month
- Spending by Category — donut chart with combined totals across all files
- Date header auto-updates: "October 2023" or "Oct–Dec 2023 Analysis (2 accounts)"
- Recent Transactions table — all transactions sorted newest first, with search + filter

### 🤖 AI Categorization (8 categories)
Every transaction auto-categorized by keyword matching:

| Category | Detected merchants |
|----------|-------------------|
| 🍔 Food | Swiggy, Zomato, BigBasket, Reliance Fresh, Blinkit, Zepto, Restaurants |
| 🚗 Transport | Uber, Ola, Rapido, IRCTC, Petrol, FASTag, RedBus |
| 🛍️ Shopping | Amazon, Flipkart, Myntra, Meesho, Nykaa, Ajio |
| 🎬 Entertainment | Netflix, Amazon Prime, Hotstar, BookMyShow, Spotify, PVR |
| ⚡ Utilities | Airtel, Jio, BSNL, BESCOM, TNEB, Electricity, Gas, DTH |
| 🏥 Healthcare | Apollo, Medplus, Netmeds, Cult Fit, Hospitals, Pharmacies |
| 💰 Income | Salary, NEFT CR, Interest, Refunds, Cashback |
| 💸 Others | ATM Withdrawals, Misc UPI |

### 📈 AI Insights Page
- Spending Spike card — detects category overspend vs previous period
- Saving Goal card — tracks savings progress
- Top Merchant card — identifies highest spending vendor
- Next Month Prediction — estimated outflow with Fixed/Variable breakdown
- Budget Goals — editable limits per category with color-coded progress bars
  - Green: under 60% used
  - Amber: 60–80% used
  - Red: over 80% used
- AI Observation — contextual spending tip

### 💬 AI Chat Interface
- ChatGPT-style UI with chat history sidebar
- Quick action chips — "Set Food Budget", "Analyze Subscriptions"
- Streaming responses powered by AI
- Sample questions: "Where did I overspend?", "Am I saving enough?", "What's my top merchant?"

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | Component-based UI |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool + dev server |
| TailwindCSS | 3 | Utility-first styling |
| React Router | v6 | Client-side routing + protected routes |
| Recharts | 2 | Bar chart + Donut chart |
| PDF.js | 3.11 | PDF text extraction (browser-side) |
| Tesseract.js | 4.1 | OCR image-to-text (browser-side, WebAssembly) |
| React Context | built-in | Global auth state |
| localStorage | browser API | Session + data persistence |

---

## 🏗️ How It Works

### Data Flow
```
User uploads file
      │
      ▼
Detect file type (.csv / .pdf / .jpg)
      │
   ┌──┴──────────────┐
   │                 │
  CSV              PDF/Image
   │                 │
Split by comma    Extract text
(detect column    (PDF.js or
 format)          Tesseract OCR)
   │                 │
   └──────┬──────────┘
          │
    Find transaction rows
    (date + description + amount)
          │
    Auto-categorize
    (keyword matching)
          │
    Check same month?
    ┌─────┴──────┐
  New month   Same month
    │              │
  Add to       Show dialog:
  existing     Replace/Merge/Cancel
    │
  Save to localStorage
    │
  Dashboard re-renders
  (charts + metrics update)
```

### CSV Format Support
```
Format A (simple):
Date,Description,Amount,Type
01/10/2023,SWIGGY ORDER,340,Debit

Format B (bank export - HDFC/Axis/ICICI):
Tran Date,Particulars,Debit,Credit,Balance
03-10-2023,NEFT-TCS,,95000,95000

Format C (SBI style):
Txn Date,Description,Ref No,Debit,Credit,Balance
```

---

## 📂 Project Structure

```
finsight-ai/
├── public/
│   └── index.html              # Title: FinSight AI
├── src/
│   ├── context/
│   │   └── AuthContext.tsx     # Global user state
│   ├── components/
│   │   ├── Sidebar.tsx         # Navigation
│   │   ├── MetricCard.tsx      # Dashboard stat cards
│   │   ├── TransactionTable.tsx
│   │   └── PrivateRoute.tsx    # Auth guard
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx          # File upload + all parsers
│   │   ├── Insights.tsx
│   │   └── Chat.tsx
│   ├── utils/
│   │   ├── csvParser.ts        # Multi-format CSV parsing
│   │   ├── pdfParser.ts        # PDF.js integration
│   │   ├── ocrParser.ts        # Tesseract.js integration
│   │   └── categorizer.ts      # Keyword categorization
│   ├── App.tsx                 # Routes
│   └── main.tsx
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/chandana444s/finsight-ai.git
cd finsight-ai

# Install
npm install

# Run locally
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

---

## 🧪 Test Files

### Sample CSV (copy and save as test.csv)
```csv
Date,Description,Amount,Type
01/10/2023,SWIGGY ORDER #4521,340,Debit
02/10/2023,AMAZON SHOPPING,1250,Debit
03/10/2023,TCS SALARY CREDIT,95000,Credit
05/10/2023,NETFLIX SUBSCRIPTION,649,Debit
06/10/2023,ZOMATO ORDER,420,Debit
09/10/2023,AIRTEL RECHARGE,599,Debit
12/10/2023,MYNTRA FASHION,3200,Debit
15/10/2023,APOLLO PHARMACY,890,Debit
17/10/2023,BOOKMYSHOW TICKETS,800,Debit
30/10/2023,ELECTRICITY BILL,1450,Debit
```

### Multi-month testing
Upload October, November, December CSVs separately.
Bar chart will show 3 bars. Dashboard will show combined totals.

### PDF testing
Download your bank statement PDF from net banking portal.
Supported: HDFC, SBI, Axis, ICICI, Kotak, Standard Chartered India.

### Image testing
Take a clear photo of your passbook page.
Good lighting + no watermarks = 90-95% OCR accuracy.

---

## 🔒 Privacy

- **100% browser-side** — no server, no database, no API calls for your data
- All transactions stored only in your browser's localStorage
- Logout wipes all financial data completely
- PDF and image parsing runs entirely in your browser (WebAssembly)
- Nothing is ever sent to any external server

---

## 🗺️ Planned Backend (Next Phase)

- [ ] FastAPI (Python) backend replacing localStorage
- [ ] PostgreSQL database for persistent multi-device storage
- [ ] JWT authentication replacing browser session
- [ ] LangChain RAG pipeline for real AI chat (query your actual transactions)
- [ ] GPT-4o transaction categorization (replacing keyword matching)
- [ ] pgvector semantic search for smart Q&A
- [ ] Celery + Redis for async PDF processing
- [ ] Google OAuth login
- [ ] Email alerts when spending exceeds budget limit
- [ ] Export spending report as PDF
- [ ] Multi-bank statement year-view comparison

---

## 🧠 Key Learnings

Building this project taught me:
- **PDF.js** — extracting structured data from PDF files entirely in the browser
- **Tesseract.js** — running OCR with WebAssembly, no server needed
- **React Context** — sharing auth state across deep component trees without prop drilling
- **React Router protected routes** — redirecting unauthenticated users automatically
- **Multi-format parsing** — handling CSV, PDF, and image with unified output format
- **Recharts** — building bar and donut charts with real dynamic data
- **localStorage patterns** — persisting complex nested state across sessions
- **UX edge cases** — duplicate detection, merge vs replace, session clearing on logout
- **Data accuracy** — why OCR accuracy depends on image quality, not code quality

---

## 👩‍💻 About the Developer

**Chandana S** — MCA Graduate

Seeking roles in: Full Stack Development · AI Integration · Software Development

- 🌐 Live App: [finsight-ai-463582276521.asia-southeast1.run.app](https://finsight-ai-463582276521.asia-southeast1.run.app)
- 💻 GitHub: [github.com/chandana444s](https://github.com/chandana444s)
- 📧 chandanass4444@gmail.com

---

*Built with React, TypeScript, PDF.js, Tesseract.js, Recharts, and TailwindCSS*
