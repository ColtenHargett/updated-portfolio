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
    "Colten Hargett studies computer science and data science at Loyola University Maryland. Projects in machine learning, AI and automation.",
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
  takeaway: string;
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
      "Can a stock's recent behavior predict tomorrow's high? My model turns each trading day into 11 numbers, finds the five days in the past five years that looked most like today, and averages what happened next. It's simple on purpose: every prediction comes with the exact days behind it.",
    // CHECK: written in your voice. Make sure it matches what you actually took away.
    takeaway:
      "The hardest part wasn't the model, it was testing it fairly. Walk-forward backtesting means it never sees the future, which is an easy mistake to make with market data.",
    approach: [
      "Pulls daily prices with yfinance and engineers 11 features: returns, spreads, volume change, moving-average gaps and volatility",
      "Scales the features and uses k-nearest neighbors to find the 5 most similar days in history",
      "Weights the closest matches most and averages their next-day highs",
      "Backtests one day at a time against two simple baselines, using only data available at that point",
    ],
    stats: [
      { value: "~1%", label: "Average error" },
      { value: "11", label: "Features per day" },
      { value: "4 / 4", label: "Stocks beat baseline" },
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
    // CHECK: the "five different sites" motivation is my guess
    summary:
      "I wanted the day's news without opening five different sites, so I built a pipeline that does the reading for me. Every morning it pulls the last 24 hours from NPR, BBC, ABC, CBS and NBC, stores the articles in a vector database, and has Gemini write a short, newspaper-style briefing that gets emailed out.",
    takeaway:
      "Keeping an LLM accurate came down to what it's allowed to see. It only gets the articles the pipeline retrieved, and the prompt tells it not to add anything else.",
    approach: [
      "Scrapes all five RSS feeds and pulls the full text of every article from the last 24 hours",
      "Splits the articles into chunks with LangChain and stores them in ChromaDB",
      "Gemini writes the briefing using only that retrieved context",
      "A scheduler runs the whole thing every morning and emails the result",
    ],
    stats: [
      { value: "5", label: "News sources" },
      { value: "24h", label: "Window" },
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
    description: "Predicts next-day highs from similar past days.",
    category: "AI / ML",
    tags: ["scikit-learn", "pandas"],
    path: "AI and Machine Learning/Stock Market Predictor/",
  },
  {
    title: "News Summary Agent",
    description: "Reads the news and emails an AI summary every morning.",
    category: "AI / ML",
    tags: ["Gemini", "ChromaDB"],
    path: "AI and Machine Learning/News Summary Agent/",
  },
  {
    title: "Movie Analyzer",
    description: "Reads movie data from CSVs and answers questions about it.",
    category: "Python",
    tags: ["Data", "CSV"],
    path: "Python/Movie Analyzer/",
  },
  {
    title: "Restaurant Analyzer",
    description: "Reads restaurant data from files and analyzes it.",
    category: "Python",
    tags: ["Data", "Files"],
    path: "Python/Restaurant Analyzer/",
  },
  {
    title: "Song Analyzer",
    description: "Sorts and searches song and artist lists.",
    category: "Python",
    tags: ["Data", "Files"],
    path: "Python/Song Analyzer/",
  },
  {
    title: "Morse Code Translator",
    description: "Translates text to Morse code and back.",
    category: "Python",
    tags: ["Parsing"],
    path: "Python/Morse Code Translator/",
  },
  {
    title: "Dice Rolling Simulator",
    description: "Rolls dice and shows how the results spread out.",
    category: "Python",
    tags: ["Simulation"],
    path: "Python/Dice Rolling Simulator.py",
  },
  {
    title: "ASCII Art Maker",
    description: "Turns text into ASCII art.",
    category: "Python",
    tags: ["CLI"],
    path: "Python/Ascii Art Maker.py",
  },
  {
    title: "Hangman",
    description: "Hangman in the terminal.",
    category: "Python",
    tags: ["Game"],
    path: "Python/Hangman.py",
  },
  {
    title: "Rock, Paper, Scissors+",
    description: "Rock, paper, scissors with five options instead of three.",
    category: "Python",
    tags: ["Game"],
    path: "Python/Rock,Paper,Scissors Rendition.py",
  },
  {
    title: "ATM Simulation",
    description: "A console ATM with deposits, withdrawals and balances.",
    category: "Java",
    tags: ["OOP", "CLI"],
    path: "Java/ATM Simulation.java",
  },
  {
    title: "Grocery List Maker",
    description: "Make and edit a grocery list in the console.",
    category: "Java",
    tags: ["Collections", "CLI"],
    path: "Java/Grocery List Maker.java",
  },
  {
    title: "Personality Test",
    description: "A scored personality quiz in the terminal.",
    category: "Java",
    tags: ["CLI"],
    path: "Java/Personality Test.java",
  },
  {
    title: "Java Exercises",
    description: "Eight practice problems from my Java course.",
    category: "Java",
    tags: ["Fundamentals"],
    path: "Java/Exercises",
  },
];

export const strengths = [
  {
    title: "I test my own work",
    body: "Every model I build gets a baseline and an honest backtest. My stock predictor had to beat two simple strategies on four different stocks before I called it done.",
  },
  {
    title: "I've led a team",
    body: "Managing 30+ lifeguards meant scheduling, training and handling emergencies with first responders. I know how to stay calm, communicate clearly and keep people on the same page.",
  },
  {
    title: "I finish what I start",
    body: "My projects run end to end, from raw data to a finished result, without me in the loop. You can see both of them working below.",
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
    body: "Double-majoring in computer science and data science, and building machine learning and automation projects alongside my coursework.",
    points: ["Hyman Science Scholars Program", "Alpha Kappa Psi", "Information Systems Student Organization"],
    kind: "education",
  },
  {
    period: "Summer 2025",
    title: "Head Guard",
    org: "Coastline Aquatics",
    place: "Glen Allen, VA",
    body: "Supervised the lifeguard team, trained new hires and set up follow-up processes that cut down on repeat issues.",
    kind: "leadership",
  },
  {
    period: "2022 — 2024",
    title: "Pool Manager",
    org: "SwimMetro Management",
    place: "Glen Allen, VA",
    body: "Managed 30+ lifeguards for three summers: scheduling, training, events, and handling emergencies with first responders.",
    kind: "leadership",
  },
  {
    period: "2021 — 2025",
    title: "Advanced Diploma",
    org: "Deep Run High School",
    place: "Glen Allen, VA",
    body: "Graduated with a 4.3 weighted GPA. Co-founded and served as vice president of the Musical History Club, and was part of FBLA and the Finance & Investment Club.",
    kind: "education",
  },
  {
    period: "2020 — Present",
    title: "Volunteer",
    org: "James River Greyhounds",
    place: "Richmond, VA",
    body: "Help plan raffles that raise about $2,500 each and work with the organization's president on adoption events.",
    kind: "community",
  },
];

// ── Personal bio (About section) ─────────────────────────────────────────────
// DRAFT: written from the résumé and projects. Lines marked "CHECK" are
// inferred rather than taken from the résumé, so confirm or rewrite them.
export const bio = {
  // Drop a photo in /public (e.g. /public/colten.jpg) and set its path here.
  // Leave as null to show the monogram card instead.
  photo: null as string | null,
  paragraphs: [
    "I grew up in Glen Allen, Virginia, just outside Richmond, and now I'm at Loyola University Maryland studying computer science and data science as part of the Hyman Science Scholars program.",
    "I like building things from scratch. Sometimes that's software, like the projects on this page, and sometimes it's a brand or a small business. The work I enjoy most is where a technical problem meets a creative one.",
    "I spent three summers managing a pool and a staff of 30+ lifeguards, which taught me to stay calm under pressure and own a problem until it's solved. At Loyola, Alpha Kappa Psi has given me a community that pushes me to grow, both personally and professionally.",
    "When I'm not in class or working on something new, I'm usually on a court playing pickleball or volleyball, or volunteering with James River Greyhounds, which I've done since 2020.",
  ],
  facts: [
    { label: "Based in", value: "Baltimore, MD" },
    { label: "Studying", value: "B.S. CS + B.S. Data Science, '29" },
    { label: "Into", value: "Machine learning, automation, building products" },
    { label: "Looking for", value: "Software, data and ML internships" },
    { label: "Involved in", value: "Alpha Kappa Psi · ISSO" },
    { label: "Off the clock", value: "Pickleball · volleyball" },
  ],
};
