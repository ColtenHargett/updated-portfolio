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
      "Can a stock's past predict tomorrow's high? This model finds the days in history that looked most like today and averages what happened next.",
    approach: [
      "11 features per trading day: returns, price spreads, volume, moving averages and volatility",
      "Finds the 5 most similar past days and weights the closest ones most",
      "Backtested one day at a time, using only data it would have had then",
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
    summary:
      "A pipeline that reads the news so I don't have to. Every night it pulls the last 24 hours from five outlets and has Gemini write a short briefing that gets emailed out.",
    approach: [
      "Scrapes NPR, BBC, ABC, CBS and NBC through their RSS feeds",
      "Splits articles into chunks and stores them in ChromaDB",
      "Gemini writes the recap from those articles only, and a scheduler sends it nightly",
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
    description: "Reads the news and emails a nightly AI summary.",
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
    body: "Double major. Building ML and automation projects on the side.",
    points: ["Hyman Science Scholars Program", "Alpha Kappa Psi", "Information Systems Student Organization"],
    kind: "education",
  },
  {
    period: "Summer 2025",
    title: "Head Guard",
    org: "Coastline Aquatics",
    place: "Glen Allen, VA",
    body: "Ran the guard team day to day and trained new hires.",
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
    title: "Advanced Diploma, 4.3 GPA",
    org: "Deep Run High School",
    place: "Glen Allen, VA",
    body: "Co-founded the Musical History Club. FBLA and the Finance & Investment Club.",
    kind: "education",
  },
  {
    period: "2020 — Present",
    title: "Volunteer",
    org: "James River Greyhounds",
    place: "Richmond, VA",
    body: "Help run raffles that raise about $2,500 each and help out at adoption events.",
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
    "I grew up in Glen Allen, Virginia, outside Richmond. Now I'm at Loyola in Baltimore as part of the Hyman Science Scholars program.",
    "Before I wrote much code, I spent three summers running a pool with a staff of 30+ lifeguards. That's where I learned to stay calm when something goes wrong and to own a problem until it's fixed.",
    // CHECK: add a hobby or two here if you want
    "Outside of class, I've volunteered with James River Greyhounds since 2020.",
  ],
  facts: [
    { label: "Based in", value: "Baltimore, MD" },
    { label: "Studying", value: "CS + Data Science, '29" },
    { label: "Into", value: "Machine learning, data, automation" },
    { label: "Looking for", value: "Internships and research" },
  ],
};
