/**
 * Comprehensive Skills Catalog & Industry Benchmarks for ATS Evaluation
 */

export const SKILL_CATEGORIES = {
  frontend: [
    'React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3',
    'Tailwind CSS', 'Redux', 'Zustand', 'Vite', 'Webpack', 'Responsive Design', 'GraphQL'
  ],
  backend: [
    'Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
    'C++', 'C#', '.NET', 'Go', 'Rust', 'PHP', 'Ruby on Rails', 'REST APIs', 'gRPC', 'Microservices'
  ],
  database: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase',
    'DynamoDB', 'Cassandra', 'Prisma', 'TypeORM', 'SQL'
  ],
  devops_cloud: [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'GitHub Actions',
    'Terraform', 'Linux', 'Bash', 'Nginx', 'Prometheus', 'Grafana'
  ],
  data_ai: [
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn',
    'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Data Analysis', 'NLP', 'LLMs', 'OpenAI'
  ],
  mobile: [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Capacitor', 'Android SDK', 'iOS Development'
  ],
  tools_methods: [
    'Git', 'GitHub', 'Agile', 'Scrum', 'Jira', 'Postman', 'Unit Testing', 'Jest',
    'Cypress', 'Playwright', 'System Design'
  ],
  soft_skills: [
    'Leadership', 'Problem Solving', 'Communication', 'Teamwork', 'Critical Thinking',
    'Cross-functional Collaboration', 'Project Management', 'Time Management', 'Mentorship'
  ]
};

export const STRONG_ACTION_VERBS = [
  'Architected', 'Spearheaded', 'Engineered', 'Orchestrated', 'Optimized',
  'Automated', 'Revamped', 'Pioneered', 'Implemented', 'Accelerated',
  'Formulated', 'Streamlined', 'Deployed', 'Constructed', 'Negotiated',
  'Overhauled', 'Surpassed', 'Supervised', 'Decoupled', 'Mentored'
];

export const WEAK_VERBS = [
  'Helped', 'Worked on', 'Handled', 'Responsible for', 'Assisted with',
  'Tried', 'Made', 'Did', 'Looked at', 'Participated in'
];

export const BENCHMARK_ROLES = [
  {
    id: 'frontend_dev',
    title: 'Frontend Engineer',
    keywords: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'Next.js', 'REST APIs', 'Git'],
    salaryRange: '$75k - $125k',
    demand: 'High Demand',
    searchKeywords: 'Frontend Engineer React TypeScript'
  },
  {
    id: 'backend_dev',
    title: 'Backend Engineer',
    keywords: ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Docker', 'Microservices', 'SQL'],
    salaryRange: '$85k - $135k',
    demand: 'Very High',
    searchKeywords: 'Backend Engineer Node Python SQL'
  },
  {
    id: 'fullstack_dev',
    title: 'Full Stack Developer',
    keywords: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Git', 'Next.js'],
    salaryRange: '$90k - $145k',
    demand: 'Extreme',
    searchKeywords: 'Full Stack Developer React Node'
  },
  {
    id: 'data_analyst',
    title: 'Data Analyst / Scientist',
    keywords: ['Python', 'SQL', 'Pandas', 'Tableau', 'Power BI', 'Machine Learning', 'Data Analysis', 'NumPy'],
    salaryRange: '$70k - $120k',
    demand: 'High Demand',
    searchKeywords: 'Data Analyst Python SQL Tableau'
  },
  {
    id: 'devops_eng',
    title: 'DevOps / Cloud Engineer',
    keywords: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'GitHub Actions', 'Bash'],
    salaryRange: '$95k - $150k',
    demand: 'Critical Demand',
    searchKeywords: 'DevOps Engineer Docker AWS Kubernetes'
  },
  {
    id: 'mobile_dev',
    title: 'Mobile App Developer',
    keywords: ['React Native', 'Flutter', 'TypeScript', 'Capacitor', 'Android SDK', 'iOS Development', 'REST APIs'],
    salaryRange: '$80k - $130k',
    demand: 'Steady Demand',
    searchKeywords: 'Mobile App Developer React Native'
  }
];

export function getJobSearchUrls(query) {
  const encoded = encodeURIComponent(query);
  return {
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encoded}`,
    indeed: `https://www.indeed.com/jobs?q=${encoded}`,
    google: `https://www.google.com/search?q=${encoded}+jobs&ibp=htl;jobs`
  };
}
