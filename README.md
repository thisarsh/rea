# ResumePulse AI ⚡
> **Next-Generation ATS Resume Analyzer & Career Readiness Intelligence**  
> Built with React 18, Vite, Tailwind CSS, Capacitor 6, and Dual-Engine AI (Groq LPU + Offline ATS Heuristic Engine).

---

## 🎯 Executive Overview

**ResumePulse AI** is a production-grade, mobile-first resume analysis and career optimization application designed to simulate modern Enterprise Applicant Tracking Systems (ATS). It evaluates resume structure, quantifies career impact, discovers transferable skills, matches high-affinity market job openings with live listings, refactors weak experience bullets using the **STAR methodology**, and generates customized mock interview questions tailored directly to project bullet points.

---

## ✨ Core Features

1. **Dual-Engine ATS Scoring (0–100)**:
   - **Groq LPU Acceleration**: High-speed real-time inference using Qwen and OpenAI models.
   - **Deterministic Fallback Engine**: Full client-side offline parsing & scoring in zero-network conditions.
   - **4 Pillars Assessment**:
     - *Quantifiable Impact (25 pts)*: Metric density, percentage improvements, and revenue/latency numbers.
     - *Brevity & Density (25 pts)*: Bullet length optimization, fluff word filtering.
     - *Skills Completeness (25 pts)*: Modern hard technical stack & soft competencies.
     - *Architecture & Format (25 pts)*: ATS-parseable sections, action verb strength.

2. **Smart Skills Extraction & Matrix**:
   - Parses 150+ categorized technical and soft skills (Frontend, Backend, Cloud/DevOps, AI/ML, Data, Core CS).
   - Filterable chip matrix showing hard vs. soft skills and missing high-value competencies.

3. **Intelligent Job Matching & Live Search**:
   - Compares resume profile with industry benchmark roles (Full Stack, Backend, Data Engineer, DevOps, etc.).
   - Computes weighted skill match percentages.
   - Direct 1-click search shortcuts into **LinkedIn Jobs**, **Indeed**, and **Google Jobs** with pre-filled targeted search queries.

4. **STAR Bullet Optimizer**:
   - Detects passive and weak verbs (`helped`, `worked on`, `assisted`, `handled`).
   - Automatically generates dual STAR rewrites (Situation/Task, Action, Result) with 1-click clipboard copy.
   - Interactive custom rewriter to test and refine arbitrary bullet points on the fly.

5. **Tailored AI Mock Interview Prep**:
   - Generates technical architecture and behavioral interview questions mapped specifically to the projects listed on the resume.
   - Provides expandable model answers and evaluation tips for college viva or company technical screenings.

6. **1-Click Demo Profiles**:
   - Pre-loaded with 3 industry profiles (**CS Fresher**, **Full Stack Developer - 2.5y**, **Data & BI Analyst**) for zero-setup live demonstration.
   - Also supports instant drag-and-drop of `.pdf` and `.txt` files or raw text pasting.

---

## 🛠️ Architecture & Tech Stack

- **Frontend Core**: React 18 (`18.3.1`), Vite 5
- **Styling**: Tailwind CSS (DilWali Dark Luxury theme: `#0b080d`, `#140e19`, rose & fuchsia glows, glassmorphism)
- **Icons**: Lucide React
- **Document Processing**: `pdfjs-dist` (pure client-side text extraction, zero server uploads needed)
- **Mobile Runtime**: Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)
- **AI Inference**: Groq Cloud REST API (Hardcoded, no API key prompts required for evaluators)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 2. Local Web Setup (1-Click)
- **Windows**: Simply double-click **`run.bat`** in the project folder. It will verify Node.js, install dependencies if missing, launch the local server, and automatically open your default browser.

Or via terminal:
```bash
# Navigate to the project directory
cd C:\Users\ASUS\Desktop\resume

# Install dependencies (if not already installed)
npm install

# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Web Preview
```bash
npm run build
npm run preview
```

### 4. Android Mobile Build (Capacitor)
```bash
# Build web bundle and sync native Android project
npm run cap:build

# Open project in Android Studio to build APK or run on emulator/device:
npx cap open android
```
*(Requires Android Studio & Android SDK installed on your system).*

---

## 📁 Project Structure

```
resume/
├── android/                   # Capacitor Native Android project
├── public/                    # Static assets & icons
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx      # Capsule top navigation with live AI status
│   │   │   └── BottomNav.jsx   # 5-tab floating navigation dock
│   │   ├── tabs/
│   │   │   ├── UploadTab.jsx         # Upload, paste, and 1-click sample presets
│   │   │   ├── ScorecardTab.jsx      # Radial gauge, 4 pillars, warnings & strengths
│   │   │   ├── JobMatchTab.jsx       # Skills matrix and live job search links
│   │   │   ├── BulletOptimizerTab.jsx# STAR rewriter & custom bullet lab
│   │   │   └── InterviewPrepTab.jsx  # AI mock viva & technical questions
│   │   └── ui/
│   │       ├── RadialGauge.jsx # Animated SVG circular meter
│   │       └── Toast.jsx       # Floating action toast
│   ├── data/
│   │   ├── demoResumes.js     # 3 pre-packaged realistic resumes
│   │   └── skillsDatabase.js  # Skills, benchmark roles, and strong action verbs
│   ├── services/
│   │   ├── aiService.js       # Dual Groq LPU + heuristic ATS scoring engine
│   │   └── pdfParserService.js# Client-side PDF text extraction
│   ├── App.jsx                # Main controller & state manager
│   ├── index.css              # Dark luxury custom styles & scrollbars
│   └── main.jsx               # React entry point
├── capacitor.config.json      # Capacitor app configuration
├── tailwind.config.js         # Theme tokens and custom utilities
└── package.json               # Dependencies and scripts
```

---

## 🎓 College Presentation & Viva Talking Points

When demonstrating this project to professors and evaluators:
1. **Explain the Dual-Engine Architecture**: Emphasize how the application uses Groq's high-speed inference for rich dynamic content while retaining an algorithmic ATS engine (token frequency, verb weighting, and regex heuristics) that functions 100% offline.
2. **Privacy First / Client-Side Parsing**: Highlight that resumes are parsed in-browser using `pdfjs-dist` WebAssembly/Worker technology rather than being transmitted to a storage bucket, ensuring zero GDPR/privacy violations.
3. **Cross-Platform Readiness**: Demonstrate that the codebase is completely cross-platform, deployable as a responsive Web PWA, and compileable to native Android via Capacitor with a single command.
4. **Actionable Feedback Loop**: Show how the app doesn't just grade resumes, but actively improves them via the STAR rewriter and prepares the applicant via tailored technical interview simulations.
