export const JOBS = [
  {
    id: "1", title: "Data Analyst", company: "Spotify", location: "New York, NY",
    remote: true, industry: "Tech / Music", type: "Full-time", seniority: "Entry-level",
    description: "We're looking for a Data Analyst to join Spotify's Growth Analytics team. You'll work with massive datasets to surface insights that drive product decisions. Collaborate with product managers, engineers, and designers to understand user behavior.",
    requirements: ["SQL (complex queries, window functions)", "Python or R for data analysis", "Experience with A/B testing and statistical analysis", "Tableau or Looker for dashboards", "Strong written and verbal communication", "Bachelor's degree in a quantitative field"],
    preferred: ["Snowflake or BigQuery", "Experience with music or streaming data", "Familiarity with Spark"],
    responsibilities: ["Build and maintain dashboards for key growth metrics", "Run and analyze A/B experiments", "Partner with product teams to define success metrics", "Present insights to senior stakeholders"],
    salary: "$75,000 – $95,000", posted: "2 days ago", source: "LinkedIn", logo_color: "#1DB954",
  },
  {
    id: "2", title: "Software Engineer – Backend", company: "Stripe", location: "San Francisco, CA",
    remote: false, industry: "Fintech", type: "Full-time", seniority: "Mid-level",
    description: "Join Stripe's Payments Infrastructure team to build the systems that power global commerce. You'll design, build, and operate high-scale distributed systems that process millions of transactions daily.",
    requirements: ["3+ years of backend engineering experience", "Proficiency in Java, Go, or Ruby", "Experience with distributed systems and microservices", "Strong understanding of databases (PostgreSQL, MySQL)", "Experience with REST APIs and system design"],
    preferred: ["Experience with payments or fintech", "Familiarity with Kafka or event-driven architectures", "Docker and Kubernetes"],
    responsibilities: ["Design and implement scalable backend services", "Own reliability and performance of critical payment flows", "Write clean, well-tested code with thorough documentation", "Participate in on-call rotations"],
    salary: "$130,000 – $170,000", posted: "1 day ago", source: "Stripe Careers", logo_color: "#635BFF",
  },
  {
    id: "3", title: "Product Manager – Consumer", company: "Duolingo", location: "Pittsburgh, PA",
    remote: true, industry: "EdTech", type: "Full-time", seniority: "Entry-level",
    description: "Duolingo is hiring a Product Manager for our core consumer learning experience. You'll own features used by millions of learners daily and work cross-functionally with design, engineering, and research.",
    requirements: ["1–3 years of product management experience", "Data-driven mindset — comfortable with SQL and A/B testing", "Excellent written and verbal communication", "Experience shipping consumer mobile or web products", "Ability to define product strategy and roadmap"],
    preferred: ["Background in consumer apps with high engagement", "Experience with growth or retention metrics", "Passion for education or language learning"],
    responsibilities: ["Define product vision and roadmap for your area", "Work with engineering and design to ship high-quality features", "Analyze user data and experiment results to inform decisions", "Communicate priorities and progress to leadership"],
    salary: "$90,000 – $120,000", posted: "3 days ago", source: "Handshake", logo_color: "#58CC02",
  },
  {
    id: "4", title: "Marketing Analyst", company: "Nike", location: "Beaverton, OR",
    remote: false, industry: "Retail / Consumer Goods", type: "Full-time", seniority: "Entry-level",
    description: "Nike's Global Marketing team is seeking a Marketing Analyst to support data-driven campaign strategy. You'll analyze campaign performance, consumer behavior, and market trends to optimize spend and creative.",
    requirements: ["SQL and Excel proficiency", "Experience with marketing analytics or digital advertising", "Understanding of key marketing metrics (ROAS, CAC, LTV)", "Strong storytelling and presentation skills", "Bachelor's degree in Marketing, Business, or related"],
    preferred: ["Google Analytics or Adobe Analytics", "Experience with paid social (Meta, TikTok, YouTube)", "Tableau or Power BI"],
    responsibilities: ["Analyze campaign performance across channels", "Build dashboards to track marketing KPIs", "Partner with brand and media teams on strategy", "Present insights to marketing leadership"],
    salary: "$65,000 – $85,000", posted: "5 days ago", source: "Indeed", logo_color: "#111111",
  },
  {
    id: "5", title: "Machine Learning Engineer", company: "OpenAI", location: "San Francisco, CA",
    remote: false, industry: "AI / Research", type: "Full-time", seniority: "Mid-level",
    description: "Join OpenAI's Applied team to build and deploy ML systems that power our products. You'll work on large-scale model training, fine-tuning, inference optimization, and production ML pipelines.",
    requirements: ["Strong Python skills", "Experience with PyTorch or TensorFlow", "Solid understanding of ML concepts (training, evaluation, fine-tuning)", "Experience building and deploying ML pipelines", "Familiarity with distributed computing"],
    preferred: ["Experience with LLMs or transformers", "CUDA / GPU optimization experience", "Kubernetes and Docker", "Research background or publications"],
    responsibilities: ["Train and fine-tune large language models", "Optimize inference latency and throughput", "Build robust ML training and evaluation pipelines", "Collaborate with research and product teams"],
    salary: "$160,000 – $220,000", posted: "1 day ago", source: "OpenAI Careers", logo_color: "#412991",
  },
  {
    id: "6", title: "Financial Analyst", company: "Goldman Sachs", location: "New York, NY",
    remote: false, industry: "Finance / Banking", type: "Full-time", seniority: "Entry-level",
    description: "Goldman Sachs Asset Management is hiring Financial Analysts to support portfolio management, client reporting, and investment research across equities and fixed income.",
    requirements: ["Excel and financial modeling (DCF, LBO, comps)", "Strong quantitative and analytical skills", "Understanding of financial markets and instruments", "Attention to detail and ability to work under pressure", "Bachelor's degree in Finance, Economics, or related"],
    preferred: ["Python or VBA for automation", "Bloomberg terminal experience", "CFA Level 1 candidate", "Prior internship in finance"],
    responsibilities: ["Build and maintain financial models", "Prepare client reports and investment memos", "Monitor portfolio performance and market trends", "Support senior analysts on deal execution"],
    salary: "$85,000 – $110,000", posted: "4 days ago", source: "LinkedIn", logo_color: "#003087",
  },
  {
    id: "7", title: "UX Designer", company: "Airbnb", location: "San Francisco, CA",
    remote: true, industry: "Travel / Tech", type: "Full-time", seniority: "Mid-level",
    description: "Airbnb's Design team is looking for a UX Designer to shape the experience of how millions of guests and hosts interact with our platform. You'll work on end-to-end design from research to final pixels.",
    requirements: ["3+ years of UX/product design experience", "Proficiency in Figma", "Experience conducting user research and usability testing", "Strong portfolio demonstrating end-to-end design process", "Ability to collaborate with cross-functional teams"],
    preferred: ["Experience designing for marketplace or two-sided platforms", "Motion design skills", "Familiarity with accessibility standards (WCAG)"],
    responsibilities: ["Lead design for key product areas", "Conduct user research and synthesize insights", "Create wireframes, prototypes, and high-fidelity mockups", "Partner with engineering to ensure quality implementation"],
    salary: "$120,000 – $150,000", posted: "2 days ago", source: "Airbnb Design", logo_color: "#FF5A5F",
  },
  {
    id: "8", title: "Data Science Intern", company: "Meta", location: "Menlo Park, CA",
    remote: false, industry: "Social Media / Tech", type: "Internship", seniority: "Intern",
    description: "Meta's Data Science internship offers hands-on experience working on real product problems. You'll design experiments, analyze large datasets, and present findings to product and engineering stakeholders.",
    requirements: ["Currently enrolled in a BS/MS/PhD in Statistics, Computer Science, or related", "SQL proficiency", "Python or R for statistical analysis", "Knowledge of experimental design and A/B testing", "Strong communication and presentation skills"],
    preferred: ["Experience with large-scale data (Hive, Spark)", "Prior internship in data science or analytics", "Knowledge of causal inference methods"],
    responsibilities: ["Design and analyze A/B experiments", "Build metrics and dashboards to track product health", "Generate insights from large behavioral datasets", "Present findings and recommendations to stakeholders"],
    salary: "$8,000 – $10,000/month", posted: "6 days ago", source: "Handshake", logo_color: "#0866FF",
  },
  {
    id: "9", title: "Software Engineer – Frontend", company: "Figma", location: "San Francisco, CA",
    remote: true, industry: "Design / SaaS", type: "Full-time", seniority: "Entry-level",
    description: "Figma is hiring Frontend Engineers who are passionate about building exceptional user experiences. You'll work on the core editor and collaborate directly with designers to ship features used by millions.",
    requirements: ["Strong JavaScript and TypeScript skills", "Experience with React or similar frameworks", "Understanding of web performance and browser rendering", "Attention to detail in UI implementation", "1+ years of professional frontend experience"],
    preferred: ["Experience with WebGL or Canvas-based rendering", "Familiarity with design tools", "Understanding of accessibility best practices"],
    responsibilities: ["Build and maintain core product features in the Figma editor", "Collaborate with design to implement pixel-perfect UIs", "Write performant, accessible, and well-tested code", "Review code and mentor junior engineers"],
    salary: "$130,000 – $160,000", posted: "3 days ago", source: "Figma Careers", logo_color: "#F24E1E",
  },
  {
    id: "10", title: "Business Analyst", company: "McKinsey & Company", location: "Chicago, IL",
    remote: false, industry: "Consulting", type: "Full-time", seniority: "Entry-level",
    description: "McKinsey's Business Analyst program is an entry point to one of the world's leading strategy consulting firms. You'll work on diverse client problems across industries and functions.",
    requirements: ["Bachelor's degree with outstanding academic record", "Strong analytical and quantitative reasoning", "Excellent written and verbal communication", "Ability to structure and solve ambiguous problems", "Leadership and teamwork experience"],
    preferred: ["Excel and PowerPoint proficiency", "SQL or basic data analysis experience", "Prior internship in consulting, finance, or strategy", "Second language"],
    responsibilities: ["Gather and analyze data to solve client problems", "Build Excel models and PowerPoint presentations", "Interview clients and synthesize qualitative insights", "Present recommendations to client leadership"],
    salary: "$90,000 – $112,000", posted: "1 week ago", source: "McKinsey Careers", logo_color: "#003750",
  },
  {
    id: "11", title: "Growth Marketing Manager", company: "Notion", location: "San Francisco, CA",
    remote: true, industry: "SaaS / Productivity", type: "Full-time", seniority: "Mid-level",
    description: "Notion is looking for a Growth Marketing Manager to lead demand generation and user acquisition efforts. You'll own paid channels, lifecycle campaigns, and growth experiments.",
    requirements: ["3+ years in growth or performance marketing", "Experience managing paid social and search (Meta, Google)", "Strong analytical skills — SQL or Excel proficiency", "Experience with lifecycle email marketing and marketing automation", "Ability to run and interpret A/B tests"],
    preferred: ["Experience with SaaS or PLG companies", "Familiarity with Amplitude, Mixpanel, or similar tools", "Attribution modeling experience"],
    responsibilities: ["Manage and optimize paid acquisition channels", "Design and run growth experiments across funnel stages", "Build email nurture sequences and lifecycle campaigns", "Report on channel performance and ROI to leadership"],
    salary: "$110,000 – $140,000", posted: "4 days ago", source: "LinkedIn", logo_color: "#000000",
  },
  {
    id: "12", title: "Software Engineering Intern", company: "Microsoft", location: "Redmond, WA",
    remote: false, industry: "Tech / Cloud", type: "Internship", seniority: "Intern",
    description: "Microsoft's Software Engineering internship provides real project ownership within one of our product teams (Azure, Office, Xbox, or AI). Interns ship code that reaches customers.",
    requirements: ["Currently enrolled in a BS/MS in Computer Science or related", "Proficiency in at least one programming language (C++, C#, Python, Java)", "Understanding of data structures and algorithms", "Experience with version control (Git)", "Strong problem-solving skills"],
    preferred: ["Prior internship experience", "Experience with cloud services (Azure, AWS)", "Contributions to open source projects"],
    responsibilities: ["Work on a scoped project with real customer impact", "Collaborate with a mentor and full-time engineers", "Write clean, tested code following team standards", "Present your project at an intern showcase"],
    salary: "$7,000 – $9,000/month", posted: "2 days ago", source: "Handshake", logo_color: "#00A4EF",
  },
]

function filterJobs({ roleTitles, industries, locations, jobType, remoteOnly }) {
  let results = [...JOBS]
  if (remoteOnly) results = results.filter(j => j.remote)
  if (jobType && jobType !== 'any') results = results.filter(j => j.type.toLowerCase() === jobType.toLowerCase())
  if (roleTitles?.length) {
    const kw = roleTitles.map(t => t.toLowerCase())
    results = results.filter(j => kw.some(k => j.title.toLowerCase().includes(k) || j.description.toLowerCase().includes(k)))
  }
  if (industries?.length) {
    const ind = industries.map(i => i.toLowerCase())
    results = results.filter(j => ind.some(i => j.industry.toLowerCase().includes(i)))
  }
  if (locations?.length) {
    const loc = locations.map(l => l.toLowerCase())
    results = results.filter(j => loc.some(l => j.location.toLowerCase().includes(l)) || j.remote)
  }
  // Always return something
  return results.length ? results : JOBS
}

export { filterJobs }
