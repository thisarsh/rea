import {
  SKILL_CATEGORIES,
  STRONG_ACTION_VERBS,
  WEAK_VERBS,
  BENCHMARK_ROLES,
  getJobSearchUrls
} from '../data/skillsDatabase';

const LOCAL_PROXY_ENDPOINT = '/api/groq';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Cleanly extract candidate's full name from top lines of resume or filename fallback
 */
function toTitleCaseName(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function extractCandidateName(resumeText, fallbackFileName = '') {
  const lines = String(resumeText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const ignoredTerms = /^(resume|curriculum\s*vitae|cv|summary|objective|education|experience|skills|projects|profile|contact|portfolio|page\s*\d+)$/i;

  for (const line of lines.slice(0, 8)) {
    // Take text before pipe/bullet separator if contact info is on same line
    const candidateChunk = line.split(/[|•·—]/)[0].trim();
    if (!candidateChunk) continue;
    if (/@|http|www\.|github\.|linkedin\.|\d{3,}/i.test(candidateChunk)) continue;
    if (ignoredTerms.test(candidateChunk)) continue;

    // Strip leading labels like "Name:"
    const cleaned = candidateChunk.replace(/^name\s*[:-]\s*/i, '').replace(/[^a-zA-Z.\s'-]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);

    if (words.length >= 1 && words.length <= 4 && cleaned.length >= 3 && cleaned.length <= 42) {
      return toTitleCaseName(cleaned);
    }
  }

  // Fallback to cleaned file name
  if (fallbackFileName) {
    const base = fallbackFileName
      .replace(/\.(pdf|txt|docx?)$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b(resume|cv|final|updated|demo)\b/gi, '')
      .trim();
    if (base.length >= 2) return toTitleCaseName(base);
  }

  return 'Candidate Resume';
}

/**
 * Main Analysis Entry Point:
 * Tries high-speed Groq AI first (~300ms); seamlessly falls back to local Heuristic ATS engine.
 */
export async function analyzeResume(resumeText, fallbackFileName = '') {
  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Resume text is too brief to analyze. Please provide a complete resume.');
  }

  const fallbackCandidate = extractCandidateName(resumeText, fallbackFileName);

  // 1. Attempt Groq Cloud AI analysis
  try {
    const aiResult = await callGroqAi(resumeText);
    if (aiResult && aiResult.atsScore) {
      const candidateName =
        aiResult.candidateName && typeof aiResult.candidateName === 'string' && aiResult.candidateName.trim().length > 1
          ? toTitleCaseName(aiResult.candidateName)
          : fallbackCandidate;

      return {
        ...aiResult,
        candidateName,
        engine: 'Groq Cloud Neural (Qwen 3.8 / Llama)',
        isOfflineFallback: false,
      };
    }
  } catch (err) {
    console.warn('[AI Service] Cloud API fallback to local heuristic engine:', err.message);
  }

  // 2. High-precision offline rule-based heuristic engine fallback
  const heuristicResult = analyzeWithLocalHeuristics(resumeText, fallbackCandidate);
  return {
    ...heuristicResult,
    candidateName: fallbackCandidate,
    engine: 'Local High-Precision Heuristic Engine (Offline Active)',
    isOfflineFallback: true,
  };
}

/**
 * Shared Groq JSON invocation helper with model cascade & clean JSON parsing
 */
async function sendGroqRequest(payloadObj) {
  const res = await fetch(LOCAL_PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadObj),
  });
  return res;
}

async function invokeGroqJson(systemPrompt, userPrompt, validateFn, maxTokens = 3400) {
  const modelsToTry = [PRIMARY_MODEL, 'openai/gpt-oss-120b', FALLBACK_MODEL];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const res = await sendGroqRequest({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.25,
        max_tokens: maxTokens,
      });

      if (!res.ok) {
        lastError = new Error(`Groq HTTP ${res.status} on ${model}`);
        continue;
      }

      const data = await res.json();
      let rawContent = data.choices?.[0]?.message?.content?.trim() || '';

      rawContent = rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/^```json/i, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      const startIdx = rawContent.indexOf('{');
      const endIdx = rawContent.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        rawContent = rawContent.slice(startIdx, endIdx + 1);
      }

      const candidateParsed = JSON.parse(rawContent);
      if (validateFn(candidateParsed)) {
        return candidateParsed;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to obtain structured JSON from Groq API');
}

/**
 * Call Groq API for Full Resume Analysis
 */
async function callGroqAi(resumeText) {
  const truncated = resumeText.slice(0, 10000);

  const systemPrompt = `You are a Principal Technical Recruiter and ATS Algorithms Architect at a Tier-1 tech company.
Analyze the provided resume and return a STRICT, VALID JSON OBJECT without any markdown code fences or conversational text.

The JSON MUST match this exact schema:
{
  "atsScore": number (0 to 100),
  "candidateName": "Full Name of the resume owner (Title Case)",
  "profileRole": "concise 2-3 word role title e.g. Software Engineer, Full-Stack Developer, Data Analyst",
  "experienceLevel": "Fresher | 1-2 Years | 2-5 Years | Senior",
  "categoryScores": {
    "impact": number (0 to 25),
    "brevity": number (0 to 25),
    "skills": number (0 to 25),
    "structure": number (0 to 25)
  },
  "verdict": "STRICTLY ONE OF THESE EXACT 3 SHORT LABELS ONLY: 'ATS Ready' OR 'Competitive' OR 'Needs Polish'",
  "summary": "2 concise sentences summarizing the candidate's core profile and top potential.",
  "strengths": ["string", "string", "string"],
  "criticalWarnings": ["string", "string", "string"],
  "extractedSkills": [
    { "name": "string", "category": "Frontend" | "Backend" | "DevOps" | "Data/AI" | "Tools" | "Soft Skills", "level": "Advanced" | "Intermediate" | "Foundational" }
  ],
  "matchingJobs": [
    {
      "title": "string",
      "matchPercentage": number (50 to 98),
      "salary": "string (e.g. ₹7L – ₹12L or $85k - $130k)",
      "demand": "Very High" | "High Demand" | "Steady",
      "reason": "One clear sentence explaining why this candidate fits."
    }
  ],
  "bulletOptimizations": [
    {
      "original": "an actual weak or mediocre bullet point found in this resume",
      "starAlternative1": "quantified STAR rewrite emphasizing speed, revenue, or efficiency",
      "starAlternative2": "architectural/leadership STAR rewrite",
      "improvementReason": "One concise sentence on why this is superior."
    }
  ],
  "interviewQuestions": [
    {
      "question": "Realistic technical or behavioral question based on their actual listed projects",
      "type": "System Design" | "Technical" | "Behavioral",
      "whyAsked": "Why an interviewer would ask this specific question.",
      "keyTalkingPoints": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ]
}`;

  const parsed = await invokeGroqJson(
    systemPrompt,
    `Analyze this resume thoroughly:\n\n${truncated}`,
    (obj) => obj && typeof obj.atsScore === 'number',
    3400
  );

  // Normalize concise verdict label for badge display
  const rawVerdict = String(parsed.verdict || '').toLowerCase();
  if (rawVerdict.includes('ready') || parsed.atsScore >= 82) {
    parsed.verdict = parsed.atsScore >= 85 ? 'ATS Ready' : 'Competitive';
  } else if (rawVerdict.includes('competitive') || parsed.atsScore >= 68) {
    parsed.verdict = 'Competitive';
  } else {
    parsed.verdict = 'Needs Polish';
  }

  if (Array.isArray(parsed.matchingJobs)) {
    parsed.matchingJobs = parsed.matchingJobs.slice(0, 5).map(job => ({
      ...job,
      searchUrls: getJobSearchUrls(job.title)
    }));
  }

  return parsed;
}

/**
 * Real-Time API Call: Generates 5 brand-new non-overlapping tailored interview questions
 */
export async function generateMoreInterviewQuestions(resumeText, existingQuestions = []) {
  const truncated = (resumeText || '').slice(0, 8000);
  const alreadyAsked = existingQuestions
    .map((q, idx) => `${idx + 1}. ${q.question}`)
    .join('\n');

  const systemPrompt = `You are a Principal Engineering Interviewer.
Generate EXACTLY 5 NEW, DISTINCT, deep interview questions tailored to this candidate's actual resume projects, skills, and experience.
DO NOT repeat or closely paraphrase any question from the previously asked list.
Return ONLY strict JSON matching:
{
  "interviewQuestions": [
    {
      "question": "Specific project, architecture, debugging, or behavioral question",
      "type": "System Design" | "Technical" | "Behavioral",
      "whyAsked": "Why interviewers ask this specific question.",
      "keyTalkingPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}`;

  const userPrompt = `Resume:\n${truncated}\n\nPreviously asked questions (DO NOT REPEAT):\n${alreadyAsked || 'None'}`;

  try {
    const parsed = await invokeGroqJson(
      systemPrompt,
      userPrompt,
      (obj) => obj && Array.isArray(obj.interviewQuestions) && obj.interviewQuestions.length > 0,
      2400
    );
    return parsed.interviewQuestions.slice(0, 5);
  } catch (err) {
    console.warn('[AI Service] More interview questions fallback:', err.message);
    return [
      {
        question: 'Walk me through a production bug or edge case you encountered in one of your listed projects and how you traced the root cause.',
        type: 'Technical',
        whyAsked: 'Evaluates debugging methodology, observability tooling, and calm problem-solving.',
        keyTalkingPoints: [
          'Explain how you reproduced and isolated the failing component.',
          'Mention specific logs, network traces, or profiler metrics you inspected.',
          'Describe the permanent fix and regression test added.'
        ]
      },
      {
        question: 'If your highest-traffic project suddenly saw a 10x spike in concurrent users tomorrow, which bottleneck would fail first?',
        type: 'System Design',
        whyAsked: 'Tests practical scalability instincts around database connections, caching, and API throughput.',
        keyTalkingPoints: [
          'Identify the database / connection pool or single-threaded compute limit.',
          'Propose horizontal scaling, read replicas, or Redis/CDN offload.',
          'Mention rate limiting and graceful degradation strategies.'
        ]
      },
      {
        question: 'Tell me about a time you disagreed with a teammate or mentor on a technical architecture choice. How did you resolve it?',
        type: 'Behavioral',
        whyAsked: 'Assesses collaboration, ego-free communication, and data-driven engineering decisions.',
        keyTalkingPoints: [
          'Frame both viewpoints fairly with clear engineering trade-offs.',
          'Show how you used prototypes, benchmarks, or requirements to align.',
          'Share what you learned and how team velocity improved.'
        ]
      },
      {
        question: 'How did you design authentication, authorization, and data validation across your full-stack APIs to prevent security vulnerabilities?',
        type: 'System Design',
        whyAsked: 'Verifies secure coding awareness around JWT/sessions, CORS, SQL injection, and RBAC.',
        keyTalkingPoints: [
          'Discuss token storage, expiration/rotation, and server-side role checks.',
          'Explain schema validation and parameterized database queries.',
          'Note protection against CSRF, XSS, and brute-force requests.'
        ]
      },
      {
        question: 'Which project on your resume required learning an unfamiliar technology quickly, and how did you verify production readiness?',
        type: 'Behavioral',
        whyAsked: 'Measures learning agility, documentation rigor, and ownership quality.',
        keyTalkingPoints: [
          'Highlight the tight timeline or ambiguous requirements.',
          'Detail how you broke the learning curve into testable milestones.',
          'Mention concrete validation (unit tests, load checks, user feedback).'
        ]
      }
    ];
  }
}

/**
 * Local High-Precision Heuristic ATS Engine (Guaranteed 0-failure offline fallback)
 */
export function analyzeWithLocalHeuristics(text) {
  const lower = text.toLowerCase();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Structure Detection
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(text);
  const hasGitHub = /github\.com\/[a-zA-Z0-9_-]+/i.test(text);

  const hasEducationHeader = /education|academic|university|degree|b\.tech|b\.e|b\.s/i.test(text);
  const hasExperienceHeader = /experience|employment|work history|career/i.test(text);
  const hasProjectsHeader = /projects|portfolio|personal projects/i.test(text);
  const hasSkillsHeader = /skills|technical skills|technologies|tools/i.test(text);

  // 2. Metrics & Numbers (Quantifiable impact)
  const numbersFound = text.match(/\b\d+(\.\d+)?(%|\+|k|m|x|ms|s|gb|mb)?\b/gi) || [];
  const metricScore = Math.min(25, Math.round((numbersFound.length / 8) * 25));

  // 3. Action Verbs
  let strongVerbCount = 0;
  STRONG_ACTION_VERBS.forEach(v => {
    const reg = new RegExp(`\\b${v}\\b`, 'i');
    if (reg.test(text)) strongVerbCount++;
  });

  let weakVerbCount = 0;
  WEAK_VERBS.forEach(v => {
    const reg = new RegExp(`\\b${v}\\b`, 'i');
    if (reg.test(text)) weakVerbCount++;
  });

  const brevityScore = Math.min(25, Math.max(8, Math.round((strongVerbCount / 6) * 22) - (weakVerbCount * 2)));

  // 4. Skills Extraction
  const extractedSkills = [];
  const foundSkillNames = new Set();

  Object.entries(SKILL_CATEGORIES).forEach(([categoryKey, skills]) => {
    const catLabel = categoryKey === 'frontend' ? 'Frontend'
      : categoryKey === 'backend' ? 'Backend'
      : categoryKey === 'database' ? 'Database'
      : categoryKey === 'devops_cloud' ? 'DevOps'
      : categoryKey === 'data_ai' ? 'Data/AI'
      : categoryKey === 'soft_skills' ? 'Soft Skills' : 'Tools';

    skills.forEach(skill => {
      // Escape for regex
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`\\b${escaped}\\b`, 'i');
      if (reg.test(text) && !foundSkillNames.has(skill.toLowerCase())) {
        foundSkillNames.add(skill.toLowerCase());
        extractedSkills.push({
          name: skill,
          category: catLabel,
          level: 'Proficient'
        });
      }
    });
  });

  const skillsScore = Math.min(25, Math.max(10, Math.round((extractedSkills.length / 10) * 25)));

  // 5. Structure Score Calculation
  let structurePoints = 5;
  if (hasEmail) structurePoints += 5;
  if (hasPhone) structurePoints += 3;
  if (hasLinkedIn || hasGitHub) structurePoints += 4;
  if (hasEducationHeader) structurePoints += 3;
  if (hasExperienceHeader || hasProjectsHeader) structurePoints += 3;
  if (hasSkillsHeader) structurePoints += 2;
  const structureScore = Math.min(25, structurePoints);

  // Total ATS Score
  const totalScore = Math.min(96, Math.max(45, metricScore + brevityScore + skillsScore + structureScore));

  const verdict = totalScore >= 82 ? 'ATS Ready' : totalScore >= 68 ? 'Competitive' : 'Needs Polish';

  // Critical warnings
  const criticalWarnings = [];
  if (!hasLinkedIn) criticalWarnings.push('Missing clickable LinkedIn profile link.');
  if (!hasGitHub && (lower.includes('developer') || lower.includes('engineer') || lower.includes('react'))) {
    criticalWarnings.push('Missing GitHub profile link to showcase code repositories.');
  }
  if (numbersFound.length < 5) {
    criticalWarnings.push('Low quantifiable metrics. Add specific %, $, ms, or user counts to bullet points.');
  }
  if (weakVerbCount > 0) {
    criticalWarnings.push(`Contains passive verbs (e.g. "Responsible for", "Helped"). Replace with leadership action verbs.`);
  }

  // Strengths
  const strengths = [];
  if (extractedSkills.length >= 8) strengths.push(`Strong technical skill diversity across ${extractedSkills.length} identified technologies.`);
  if (strongVerbCount >= 4) strengths.push(`Effective use of high-impact action verbs (e.g. ${STRONG_ACTION_VERBS.slice(0, 3).join(', ')}).`);
  if (hasEducationHeader && (hasProjectsHeader || hasExperienceHeader)) strengths.push('Clean chronological section hierarchy with clear technical divisions.');
  if (strengths.length === 0) strengths.push('Clear educational and foundational technical background.');

  // Matching Job Roles computation
  const matchingJobs = BENCHMARK_ROLES.map(role => {
    let matchedKeywords = 0;
    role.keywords.forEach(kw => {
      if (lower.includes(kw.toLowerCase())) matchedKeywords++;
    });
    const matchPct = Math.min(96, Math.max(45, Math.round((matchedKeywords / role.keywords.length) * 88) + 12));
    return {
      title: role.title,
      matchPercentage: matchPct,
      salary: role.salaryRange,
      demand: role.demand,
      reason: `Matches ${matchedKeywords} core competencies including ${role.keywords.slice(0, 3).join(', ')}.`,
      searchUrls: getJobSearchUrls(role.searchKeywords)
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);

  // Weak Bullet Detection & STAR Generator
  const candidateBullets = lines.filter(l => l.startsWith('-') || l.startsWith('•') || l.length > 50).slice(0, 10);
  const bulletOptimizations = [];

  const sampleWeak1 = candidateBullets.find(b => WEAK_VERBS.some(v => b.toLowerCase().includes(v.toLowerCase()))) || candidateBullets[0] || 'Worked on user interface and fixed bugs in team project.';
  const sampleWeak2 = candidateBullets[1] || 'Integrated backend APIs and managed database tables for project application.';

  bulletOptimizations.push({
    original: sampleWeak1.replace(/^[-•*]\s*/, ''),
    starAlternative1: 'Spearheaded frontend architecture overhaul using React & TypeScript, boosting page responsiveness by 34% and cutting load time under 1.2s.',
    starAlternative2: 'Engineered 15+ reusable responsive UI components, accelerating sprint delivery by 25% and resolving 40+ high-priority user-facing bugs.',
    improvementReason: 'Adds measurable performance indicators (34% speed boost, 1.2s benchmark) and eliminates passive phrasing.'
  });

  bulletOptimizations.push({
    original: sampleWeak2.replace(/^[-•*]\s*/, ''),
    starAlternative1: 'Reduced API query latency by 42% by indexing core database collections and introducing Redis caching across 12 endpoints.',
    starAlternative2: 'Architected fault-tolerant backend services supporting 10,000+ concurrent requests with 99.9% uptime and automated monitoring.',
    improvementReason: 'Quantifies system reliability and highlights architectural ownership.'
  });

  // Mock Interview Questions based on actual skills
  const topSkillsList = extractedSkills.slice(0, 3).map(s => s.name);
  const skill1 = topSkillsList[0] || 'System Architecture';
  const skill2 = topSkillsList[1] || 'REST APIs';

  const interviewQuestions = [
    {
      question: `Can you walk us through a challenging project where you utilized ${skill1}? How did you measure success?`,
      type: 'System Design',
      whyAsked: `Tests direct hands-on proficiency and problem-solving depth in ${skill1}.`,
      keyTalkingPoints: [
        'State the business problem and initial technical constraints.',
        'Detail specific architecture decisions and trade-offs considered.',
        'Conclude with measurable outcomes (latency, user count, or memory savings).'
      ]
    },
    {
      question: `How do you handle error states, latency spikes, and reliability in your ${skill2} implementations?`,
      type: 'Technical',
      whyAsked: 'Evaluates production readiness, defensive coding, and microservice hygiene.',
      keyTalkingPoints: [
        'Mention retry policies with exponential backoff and circuit breakers.',
        'Discuss input validation, status codes, and structured error logging.',
        'Explain caching strategies with Redis or stale-while-revalidate.'
      ]
    },
    {
      question: 'Describe a situation where you identified an inefficiency in a project and took the initiative to optimize it.',
      type: 'Behavioral',
      whyAsked: 'Assesses proactivity, engineering ownership, and measurable impact.',
      keyTalkingPoints: [
        'Describe the baseline bottleneck before intervention.',
        'Explain the technical approach taken without waiting for top-down orders.',
        'Share the tangible outcome and feedback from team or users.'
      ]
    }
  ];

  const experienceMatch = text.match(/(\d+\+?\s*years?)/i);
  const experienceLevel = experienceMatch ? experienceMatch[1] : (lower.includes('senior') ? '3+ Years' : 'Fresher');
  const profileRole = matchingJobs[0]?.title?.split('(')[0]?.trim() || 'Software Engineer';

  return {
    atsScore: totalScore,
    profileRole,
    experienceLevel,
    categoryScores: {
      impact: metricScore,
      brevity: brevityScore,
      skills: skillsScore,
      structure: structureScore
    },
    verdict,
    summary: `Your resume shows strong technical skills and relevant experience in ${extractedSkills.slice(0, 3).map(s => s.name).join(', ') || 'core software engineering'}. With a few targeted metric improvements, you can make it highly competitive for top roles.`,
    strengths,
    criticalWarnings,
    extractedSkills,
    matchingJobs,
    bulletOptimizations,
    interviewQuestions
  };
}
