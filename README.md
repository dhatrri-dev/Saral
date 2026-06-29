# Saral — Simplifying India's Bureaucracy with AI

<div align="center">

**Saral** is an AI-powered civic technology platform that makes Indian government scheme documents, policy notices, and eligibility criteria accessible to every citizen — regardless of literacy, language, or technical background.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5--flash--lite-blue?logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 The Problem

Every year, millions of Indian citizens miss out on government benefits they are legally entitled to — simply because the notices and scheme guidelines are written in impenetrable bureaucratic language.

Phrases like:
> *"Provisional disbursement pursuant to clause 4(b), subject to domicile certification not exceeding twelve months' validity..."*

...are completely inaccessible to most people, especially those in rural areas, first-generation students, and citizens with limited formal education.

**Saral fixes this.**

---

## ✨ What Saral Does

Saral takes any government document — paste it, speak it, upload a PDF or photo — and breaks it down into five plain-language components using Gemini AI:

| Component | What it tells you |
|-----------|------------------|
| 📄 **Summary** | What the document is actually about in 3–4 simple sentences |
| ✅ **Eligibility** | Whether you qualify and exactly why |
| 📋 **Documents Needed** | A clean checklist of every proof/certificate required |
| 🗺️ **Next Steps** | Actionable, chronological steps with deadline warnings |
| 🚩 **Red Flags** | Hidden fees, unfair clauses, or suspicious conditions |

---

## 🚀 Features

### 🤖 AI Document Simplifier
- **Paste** any government notice or scheme text
- **Upload** PDFs (including scanned documents) — processed natively by Gemini's multimodal API
- **Upload** photos of physical letters or documents
- **Voice Dictation** — speak your document using native browser speech recognition

### 🌐 Multilingual Support
- Full translation to **Hindi** and **Telugu** with one click
- **Native accent text-to-speech** — reads the simplified content aloud in `en-IN`, `hi-IN`, or `te-IN`
- Translations are cached client-side to avoid redundant API calls

### 💬 AI Chatbot
- Gemini-powered **floating chat assistant** available on every page
- Answers questions about eligibility, required documents, or specific schemes
- Maintains **full conversation context** across follow-up questions
- Gives structured, personalized recommendations with headings and bullet points

### 🎯 Eligibility Matcher (Rules Engine)
- A strict **demographic rules engine** matching user profiles to real government schemes
- Filters by: Age, Gender, Caste/Category (SC/ST/OBC/EWS/General), Annual Family Income, State, Occupation, Education Level, and Course/Stream
- **Income bands** match real government-defined slabs (Below ₹1L, ₹1–2L, ₹2–2.5L, ₹2.5–5L, ₹5–8L, Above ₹8L)
- **Dynamic form** — selecting "Student" reveals education level and stream fields
- **Stream-locked filtering** — Science-only schemes (like INSPIRE) disappear if Engineering is selected
- **"Potentially Eligible"** status for schemes requiring additional criteria not in the form (e.g., PMAY-U)
- Removes awareness/non-individual schemes (e.g., Beti Bachao Beti Padhao) from results

### 🗂️ Scheme Explorer
- Browse **80+ real Indian government schemes** (Central + State-specific)
- Filter by category: Student, Farmer, Women, Senior Citizen, Healthcare, General
- Real-time search by scheme name or description
- Expand cards to view eligibility criteria and required documents
- **Bookmark/Save** schemes directly to your authenticated dashboard

### 🔐 Authentication & Personal Dashboard
- **Supabase Auth** — secure sign up and sign in
- **Navbar** instantly synchronizes with auth state — live session awareness across page refreshes
- **Profile Dropdown Menu** — access Dashboard and Sign Out from any page
- **Personal Dashboard** stores:
  - Simplified documents (with full AI breakdown preserved)
  - Saved/bookmarked schemes
  - Saved eligibility match profiles (with formatted income ranges and actual matched scheme names)
- All data scoped by Row Level Security (RLS) — users only see their own data

### 🛡️ Reliability
- **Retry logic** — all Gemini API calls automatically retry up to 2 times on 429/503/5xx errors
- **PDF fallback** — native Gemini multimodal processing handles scanned PDFs that local parsers cannot
- **Demo Mode** — available only via `DEMO_MODE=true` env variable, never triggered by API failure

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI Engine | Google Gemini 2.5 Flash Lite |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Icons | Lucide React |

---

## 📁 Project Structure

```
saral/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage — Paste / Upload / Voice input
│   │   ├── result/               # Simplified document results page
│   │   ├── matcher/              # Eligibility Matcher form
│   │   ├── explorer/             # Scheme Explorer browser
│   │   ├── dashboard/            # Authenticated user dashboard
│   │   ├── login/                # Sign in / Sign up page
│   │   ├── Navbar.tsx            # Global navbar with auth sync
│   │   └── api/
│   │       ├── simplify/         # Document simplification API (Gemini)
│   │       ├── translate/        # Translation API (Gemini)
│   │       ├── match/            # Eligibility matching rules engine
│   │       └── chat/             # AI chatbot API (Gemini)
│   └── components/
│       └── Chatbot.tsx           # Floating AI chat widget
├── data/
│   ├── schemes.json              # 80+ government schemes with full eligibility metadata
│   └── exampleDocs.json          # Pre-loaded example government notices
├── lib/
│   └── supabase.ts               # Supabase client
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/dhatrri-dev/Saral.git
cd Saral
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get your keys:**
- Gemini API Key → [Google AI Studio](https://aistudio.google.com/)
- Supabase → [supabase.com](https://supabase.com/) — create a free project

### 3. Set up the Supabase database
Run the following SQL in your Supabase SQL Editor:

```sql
-- Saved schemes (from Scheme Explorer)
CREATE TABLE saved_schemes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  scheme_id TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eligibility match profiles
CREATE TABLE eligibility_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  profile JSONB NOT NULL,
  matched_scheme_ids TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved simplified documents
CREATE TABLE saved_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  summary TEXT,
  eligibility TEXT,
  documents_needed TEXT[],
  next_steps JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own schemes" ON saved_schemes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schemes" ON saved_schemes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own matches" ON eligibility_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matches" ON eligibility_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own documents" ON saved_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON saved_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Government Schemes Covered

The `data/schemes.json` file contains **80+ verified Indian government schemes**, including:

**Central Schemes:**
PM-KISAN, Ayushman Bharat, PM Jan Dhan Yojana, PMAY-G, PMAY-U, NSP Merit Scholarship, INSPIRE, AICTE Pragati, PM YASASVI, Sukanya Samriddhi, PMMVY, Ujjwala Yojana, MGNREGA, MUDRA, PM Kaushal Vikas, and many more.

**State Schemes:**
Rythu Bandhu (Telangana), Amma Vodi (AP), KCR Kit (Telangana), Kalyana Lakshmi (Telangana), Majhi Kanya Bhagyashree (Maharashtra), Bhagyalakshmi (Karnataka), LIFE Mission (Kerala), CM's Health Insurance (Tamil Nadu), and more.

Each scheme includes:
- `eligibility.minAge` / `maxAge`
- `eligibility.maxIncome` (in INR)
- `eligibility.occupation`
- `eligibility.states`
- `eligibility.gender`
- `eligibility.categories` (SC/ST/OBC/EWS/General)
- `eligibility.educationLevel` (for student schemes)
- `eligibility.course` (for stream-specific schemes)
- `eligibility.specialConditions` (pregnancy, disability, etc.)
- `documentsNeeded`

---

## 📸 Screenshots

<img width="1536" height="815" alt="Screenshot 2026-06-29 181556" src="https://github.com/user-attachments/assets/5504c52e-6e91-45c1-891b-44297cd2bced" />
<img width="1536" height="809" alt="Screenshot 2026-06-29 181628" src="https://github.com/user-attachments/assets/21af3b81-2176-4739-8fad-00f0e51b19f0" />
<img width="1536" height="813" alt="Screenshot 2026-06-29 181648" src="https://github.com/user-attachments/assets/f86a6fea-8508-4bdc-a7a3-f0280428ee52" />
<img width="1532" height="812" alt="Screenshot 2026-06-29 182832" src="https://github.com/user-attachments/assets/9e80cb11-989f-43e8-bcad-764ceafd7514" />
<img width="1536" height="811" alt="Screenshot 2026-06-29 182853" src="https://github.com/user-attachments/assets/75411d75-25c1-4c49-9dae-3e436db3468d" />
<img width="1532" height="810" alt="Screenshot 2026-06-29 182912" src="https://github.com/user-attachments/assets/caf43802-3642-4dd3-8d15-d244d3285f66" />
<img width="1536" height="810" alt="Screenshot 2026-06-29 182929" src="https://github.com/user-attachments/assets/6b2a49f7-1c70-476d-a610-04a0063de107" />
<img width="1521" height="796" alt="Screenshot 2026-06-29 183007" src="https://github.com/user-attachments/assets/3c271b00-f396-4fd3-adb2-12e6c028dd75" />
<img width="1532" height="809" alt="Screenshot 2026-06-29 183051" src="https://github.com/user-attachments/assets/1cec8307-8dc1-4d1b-9ea5-8cbcd2089296" />
<img width="1534" height="808" alt="Screenshot 2026-06-29 183148" src="https://github.com/user-attachments/assets/b5feeccd-9fef-475c-bd96-da4a4f4f8f4b" />
<img width="1536" height="807" alt="Screenshot 2026-06-29 183221" src="https://github.com/user-attachments/assets/e8bdbb22-001f-4c44-b7c9-bbbeae37eddf" />
<img width="1535" height="811" alt="Screenshot 2026-06-29 183426" src="https://github.com/user-attachments/assets/2f69d6eb-6471-4db3-be8c-56b5debb9491" />
<img width="1536" height="816" alt="Screenshot 2026-06-29 183444" src="https://github.com/user-attachments/assets/4bab7f45-d5e3-4fd1-9367-9dabf6c1e179" />
<img width="1536" height="812" alt="Screenshot 2026-06-29 183501" src="https://github.com/user-attachments/assets/e78e3996-b32e-405f-a161-c16cb44e84c0" />
<img width="1536" height="808" alt="Screenshot 2026-06-29 183525" src="https://github.com/user-attachments/assets/f50df13a-86b5-4275-aa33-3e031386606b" />
<img width="1536" height="813" alt="Screenshot 2026-06-29 183556" src="https://github.com/user-attachments/assets/effcbb25-7ca2-424a-84f6-e0b8fcbdfed5" />
<img width="1536" height="803" alt="Screenshot 2026-06-29 183623" src="https://github.com/user-attachments/assets/75552e61-066a-436e-ba11-78bafaf428c6" />
<img width="1529" height="798" alt="Screenshot 2026-06-29 183646" src="https://github.com/user-attachments/assets/85ab2acb-454e-4280-9f83-0062321286a8" />
<img width="1532" height="809" alt="Screenshot 2026-06-29 183707" src="https://github.com/user-attachments/assets/a9466b57-344d-47ad-998d-8fb8d35c845f" />
<img width="1536" height="812" alt="Screenshot 2026-06-29 183737" src="https://github.com/user-attachments/assets/aadd5238-f94b-4913-b3ad-f6ade555e15d" />
<img width="1536" height="813" alt="Screenshot 2026-06-29 183818" src="https://github.com/user-attachments/assets/420fe339-6f74-4531-9157-742967a5a0b1" />
<img width="1494" height="805" alt="Screenshot 2026-06-29 183838" src="https://github.com/user-attachments/assets/420d2221-3e39-445b-8dc6-82479963b702" />
<img width="1536" height="807" alt="Screenshot 2026-06-29 183902" src="https://github.com/user-attachments/assets/2839d1d9-56e0-447a-ad0f-28266df9e6dd" />
<img width="1536" height="816" alt="Screenshot 2026-06-29 183921" src="https://github.com/user-attachments/assets/07028806-1d06-45de-b5d3-25a76bcdd35b" />

## 🤝 Contributing

Contributions are welcome! If you'd like to add more government schemes, improve translations, or enhance the matching logic:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/add-more-schemes`
3. Commit your changes: `git commit -m 'feat: add 10 new state schemes for Punjab'`
4. Push to the branch: `git push origin feature/add-more-schemes`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Built By

**Dhatrri** — Built for the citizens of India 🇮🇳

---

<div align="center">
<sub>If Saral helped you, please ⭐ the repository!</sub>
</div>
