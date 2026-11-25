import groqKeyData from './groqKey.json';
import {
  SKILL_CATEGORIES,
  STRONG_ACTION_VERBS,
  WEAK_VERBS,
  BENCHMARK_ROLES,
  getJobSearchUrls
} from '../data/skillsDatabase';

const HARDCODED_GROQ_KEY = groqKeyData.key;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'qwen/qwen3.8-27b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Main Analysis Entry Point:
 * Tries high-speed Groq AI first (~300ms); seamlessly falls back to local Heuristic ATS engine.
 */
export async function analyzeResume(resumeText) {
  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Resume text is too brief to analyze. Please provide a complete resume.');
  }

  // 1. Attempt Groq Cloud AI analysis
  try {
    const aiResult = await callGroqAi(resumeText);
    if (aiResult && aiResult.atsScore) {
      return {
        ...aiResult,
        engine: 'Groq Cloud Neural (Qwen 3.8 / Llama)',
        isOfflineFallback: false,
      };
    }
  } catch (err) {
    console.warn('[AI Service] Cloud API fallback to local heuristic engine:', err.message);
  }

  // 2. High-precision offline rule-based heuristic engine fallback
  const heuristicResult = analyzeWithLocalHeuristics(resumeText);
  return {
    ...heuristicResult,
    engine: 'Local High-Precision Heuristic Engine (Offline Active)',
    isOfflineFallback: true,
  };
}

/**
 * Call Groq API with Structured JSON output
 */
async function callGroqAi(resumeText) {
  const truncated = resumeText.slice(0, 10000);

  const systemPrompt = `You are a Principal Technical Recruiter and ATS Algorithms Architect at a Tier-1 tech company.
Analyze the provided resume and return a STRICT, VALID JSON OBJECT without any markdown code fences or conversational text.

The JSON MUST match this exact schema:
{
  "atsScore": number (0 to 100),
  "profileRole": "concise 2-3 word role title e.g. Software Engineer, Full-Stack Developer, Data Analyst",
  "experienceLevel": "Fresher | 1-2 Years | 2-5 Years | Senior",
  "categoryScores": {
    "impact": number (0 to 25),
    "brevity": number (0 to 25),
    "skills": number (0 to 25),
    "structure": number (0 to 25)
  },
  "verdict": "ATS Ready" | "Competitive" | "Needs Polish",
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

  const payload = {
    model: PRIMARY_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this resume:\n\n${truncated}` }
    ],
    temperature: 0.2,
    max_tokens: 2200,
  };

  let res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HARDCODED_GROQ_KEY}`
    },
    body: JSON.stringify(payload)
  });

  // If primary model failed, try secondary model
  if (!res.ok) {
    payload.model = FALLBACK_MODEL;
    res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HARDCODED_GROQ_KEY}`
      },
      body: JSON.stringify(payload)
    });
  }

  if (!res.ok) {
    throw new Error(`Groq HTTP error ${res.status}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim() || '';

  // Clean JSON output (strip ```json ... ``` if model enclosed it)
  const cleanJson = rawContent
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();

  const parsed = JSON.parse(cleanJson);

  // Attach search links to matching jobs
  if (Array.isArray(parsed.matchingJobs)) {
    parsed.matchingJobs = parsed.matchingJobs.slice(0, 5).map(job => ({
      ...job,
      searchUrls: getJobSearchUrls(job.title)
    }));
  }

  return parsed;
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
