// All site copy lives here so it can be edited without touching components.

export const site = {
  name: "Colten Hargett",
  role: "Computer Science & Data Science",
  school: "Loyola University Maryland",
  location: "Baltimore, MD",
  email: "coltenhargett@gmail.com",
  linkedin: "https://www.linkedin.com/in/colten-hargett",
  github: "https://github.com/ColtenHargett",
  projectsRepo: "https://github.com/ColtenHargett/portfolio-projects",
  resume: "/resume.pdf",
  url: "https://coltenhargett.com",
  description:
    "Colten Hargett is a Computer Science and Data Science student at Loyola University Maryland building machine learning systems, AI automation pipelines, and thoughtful software.",
};

export function repoLink(path: string) {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const kind = /\.[a-z0-9]+$/i.test(clean) ? "blob" : "tree";
  return `${site.projectsRepo}/${kind}/main/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

export const marquee = [
  "Python",
  "Machine Learning",
  "scikit-learn",
  "pandas",
  "NumPy",
  "Java",
  "LLM Agents",
  "RAG Pipelines",
  "ChromaDB",
  "Gemini API",
  "LangChain",
  "Backtesting",
  "Data Science",
  "Automation",
  "HTML / CSS",
  "Unix",
];

export type Featured = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  summary: string;
  problem: string;
  approach: string[];
  stats: { value: string; label: string }[];
  stack: string[];
  path: string;
  visual: "stock" | "pipeline";
};

export const featured: Featured[] = [
  {
    id: "stock-predictor",
    index: "01",
    title: "Stock Market Predictor",
    kicker: "Machine Learning · Forecasting",
    summary:
      "A similarity-based forecasting engine that predicts a stock's next-day high by finding the moments in history that looked most like today.",
    problem:
      "Most market models are black boxes. I wanted one I could actually reason about: every prediction explained by the real historical days behind it.",
    approach: [
      "Engineered 11 features per trading day: returns, spreads, volume change, moving-average gaps and volatility",
      "Standardized feature space + k-nearest-neighbors to find the most similar historical days",
      "Inverse-distance weighting, so the closest matches carry the most influence",
      "Walk-forward backtesting that only ever sees the past, benchmarked against two naive baselines",
    ],
    stats: [
      { value: "~1%", label: "Mean abs. % error" },
      { value: "11", label: "Engineered features" },
      { value: "4 / 4", label: "Tickers beat baseline" },
    ],
    stack: ["Python", "scikit-learn", "pandas", "NumPy", "yfinance"],
    path: "AI and Machine Learning/Stock Market Predictor/",
    visual: "stock",
  },
  {
    id: "news-agent",
    index: "02",
    title: "News Summary Agent",
    kicker: "AI Agents · Automation",
    summary:
      "An autonomous pipeline that reads the day's news from five major outlets, indexes it into a vector database, and delivers a newspaper-style briefing by email every night.",
    problem:
      "Keeping up with the news takes time and a dozen tabs. I wanted a system that does the reading for me and hands back one clean, trustworthy summary.",
    approach: [
      "RSS scraper pulls the last 24 hours from NPR, BBC, ABC, CBS and NBC and extracts full article text",
      "Articles are chunked with LangChain and embedded into a persistent ChromaDB collection",
      "Gemini writes a grounded, editor-style recap using only the retrieved context",
      "A scheduler runs the full pipeline nightly and emails the briefing out automatically",
    ],
    stats: [
      { value: "5", label: "News sources" },
      { value: "24h", label: "Rolling window" },
      { value: "0", label: "Manual steps" },
    ],
    stack: ["Python", "Gemini", "ChromaDB", "LangChain", "RSS"],
    path: "AI and Machine Learning/News Summary Agent/",
    visual: "pipeline",
  },
];

export type ArchiveItem = {
  title: string;
  description: string;
  category: "AI / ML" | "Python" | "Java";
  tags: string[];
  path: string;
};

export const archive: ArchiveItem[] = [
  {
    title: "Stock Market Predictor",
    description: "k-NN forecasting of next-day highs with walk-forward backtesting.",
    category: "AI / ML",
    tags: ["scikit-learn", "pandas"],
    path: "AI and Machine Learning/Stock Market Predictor/",
  },
  {
    title: "News Summary Agent",
    description: "Scrape → embed → summarize → email, fully automated every night.",
    category: "AI / ML",
    tags: ["Gemini", "ChromaDB"],
    path: "AI and Machine Learning/News Summary Agent/",
  },
  {
    title: "Movie Analyzer",
    description: "Parses movie datasets and produces structured, queryable output.",
    category: "Python",
    tags: ["Data", "CSV"],
    path: "Python/Movie Analyzer/",
  },
  {
    title: "Restaurant Analyzer",
    description: "Reads restaurant records from files and surfaces useful insights.",
    category: "Python",
    tags: ["Data", "Files"],
    path: "Python/Restaurant Analyzer/",
  },
  {
    title: "Song Analyzer",
    description: "Processes song and artist catalogs with custom analysis functions.",
    category: "Python",
    tags: ["Data", "Files"],
    path: "Python/Song Analyzer/",
  },
  {
    title: "Morse Code Translator",
    description: "Bidirectional text ↔ Morse translation, including file input.",
    category: "Python",
    tags: ["Parsing"],
    path: "Python/Morse Code Translator/",
  },
  {
    title: "Dice Rolling Simulator",
    description: "Simulates rolls and visualizes how outcomes distribute over time.",
    category: "Python",
    tags: ["Simulation"],
    path: "Python/Dice Rolling Simulator.py",
  },
  {
    title: "ASCII Art Maker",
    description: "Turns plain text input into generated ASCII artwork.",
    category: "Python",
    tags: ["CLI"],
    path: "Python/Ascii Art Maker.py",
  },
  {
    title: "Hangman",
    description: "Command-line hangman with thorough input validation.",
    category: "Python",
    tags: ["Game"],
    path: "Python/Hangman.py",
  },
  {
    title: "Rock, Paper, Scissors+",
    description: "A five-choice strategy variant with custom rules and outcomes.",
    category: "Python",
    tags: ["Game"],
    path: "Python/Rock,Paper,Scissors Rendition.py",
  },
  {
    title: "ATM Simulation",
    description: "Account balances, transactions and input checking in the console.",
    category: "Java",
    tags: ["OOP", "CLI"],
    path: "Java/ATM Simulation.java",
  },
  {
    title: "Grocery List Maker",
    description: "Build, edit and manage grocery lists interactively.",
    category: "Java",
    tags: ["Collections", "CLI"],
    path: "Java/Grocery List Maker.java",
  },
  {
    title: "Personality Test",
    description: "An interactive, scored personality quiz for the command line.",
    category: "Java",
    tags: ["CLI"],
    path: "Java/Personality Test.java",
  },
  {
    title: "Java Exercises",
    description: "Eight problem sets drilling core language fundamentals.",
    category: "Java",
    tags: ["Fundamentals"],
    path: "Java/Exercises",
  },
];

export const principles = [
  {
    title: "Clarity over cleverness",
    body: "Code should explain itself. If something needs a paragraph of comments, it usually wants to be simpler.",
  },
  {
    title: "Built for messy reality",
    body: "Real data is never clean. I validate inputs and design for edge cases so things keep working when conditions aren't ideal.",
  },
  {
    title: "Measure, don't guess",
    body: "Every model gets a baseline and a backtest. If it can't beat the simple answer, it isn't done yet.",
  },
  {
    title: "AI where it earns its place",
    body: "I reach for machine learning when it produces measurable value, not to check a box.",
  },
];

export type JourneyItem = {
  period: string;
  title: string;
  org: string;
  place: string;
  body: string;
  points?: string[];
  kind: "education" | "leadership" | "community";
};

export const journey: JourneyItem[] = [
  {
    period: "2025 — 2029",
    title: "B.S. Computer Science & B.S. Data Science",
    org: "Loyola University Maryland",
    place: "Baltimore, MD",
    body: "Double-majoring at the intersection of software engineering and data. Building ML and automation projects alongside coursework.",
    points: ["Hyman Science Scholars Program", "Alpha Kappa Psi", "Information Systems Student Organization"],
    kind: "education",
  },
  {
    period: "Summer 2025",
    title: "Head Guard",
    org: "Coastline Aquatics",
    place: "Glen Allen, VA",
    body: "Supervised lifeguard teams, ran onboarding and training, and designed follow-up processes that cut down on recurring issues.",
    kind: "leadership",
  },
  {
    period: "2022 — 2024",
    title: "Pool Manager",
    org: "SwimMetro Management",
    place: "Glen Allen, VA",
    body: "Led 30+ lifeguards across three seasons: scheduling, training, patron events and incident response alongside first responders.",
    kind: "leadership",
  },
  {
    period: "2021 — 2025",
    title: "Advanced Diploma · 4.3 Weighted GPA",
    org: "Deep Run High School",
    place: "Glen Allen, VA",
    body: "Co-founded and served as Vice President of the Musical History Club. Member of FBLA and the Finance & Investment Club.",
    kind: "education",
  },
  {
    period: "2020 — Present",
    title: "Volunteer",
    org: "James River Greyhounds",
    place: "Richmond, VA",
    body: "Help plan bi-annual raffles averaging $2,500 raised and work directly with the organization's president on adoption events.",
    kind: "community",
  },
];

export const stats = [
  { value: 14, suffix: "", label: "Projects built" },
  { value: 30, suffix: "+", label: "People led" },
  { value: 2, suffix: "", label: "Majors" },
  { value: 4.3, suffix: "", label: "HS weighted GPA", decimals: 1 },
];
