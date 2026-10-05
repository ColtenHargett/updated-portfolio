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
  resume: "/Colten-Hargett-Resume.pdf",
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
  "Data Structures",
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
  category: "AI / ML" | "Python" | "Java" | "Shell";
  tags: string[];
  path: string;
};

// Strongest first: the list shows the top rows until "Show all" is clicked.
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
    title: "Restaurant Order System",
    description: "Takes orders, lets VIPs skip the line and tracks every order to the table.",
    category: "Java",
    tags: ["BST", "Queues", "Stacks"],
    path: "Java/Restaurant Order System/",
  },
  {
    title: "List Performance Study",
    description: "Times ArrayList against LinkedList and finds a 150-second vs 0.2-second gap.",
    category: "Java",
    tags: ["Big O", "gnuplot"],
    path: "Java/List Performance Study/",
  },
  {
    title: "Sorting Benchmark",
    description: "Races three sorting algorithms on up to 480,000 numbers and charts the results.",
    category: "Java",
    tags: ["Big O", "Performance"],
    path: "Java/Sorting Benchmark/",
  },
  {
    title: "Sorted Contact Book",
    description: "A phonebook on a linked list I built from scratch that stays alphabetized.",
    category: "Java",
    tags: ["Linked List"],
    path: "Java/Sorted Contact Book/",
  },
  {
    title: "Word Alphabetizer",
    description: "Sorts words with a hand-built binary search tree and three traversals.",
    category: "Java",
    tags: ["BST", "Recursion"],
    path: "Java/Word Alphabetizer/",
  },
  {
    title: "Palindrome Finder",
    description: "Recursively checks 104,000 dictionary words and finds 160 palindromes.",
    category: "Java",
    tags: ["Recursion", "File I/O"],
    path: "Java/Palindrome Finder/",
  },
  {
    title: "Fantasy Team Manager",
    description: "Draft a fantasy football team from 130+ real players and save it for later.",
    category: "Java",
    tags: ["HashMap", "File I/O"],
    path: "Java/Fantasy Team Manager/",
  },
  {
    title: "Band Directory",
    description: "A command-line lookup for band members, designed before it was coded.",
    category: "Java",
    tags: ["Generics", "OOP Design"],
    path: "Java/Band Directory/",
  },
  {
    title: "Text Processing",
    description: "One-line data cleaning with grep, sed and awk: logs, XML, phone numbers, movie profits.",
    category: "Shell",
    tags: ["Regex", "awk", "sed"],
    path: "Shell/Text Processing/",
  },
  {
    title: "Bash Scripts",
    description: "Small command-line tools: a calculator, a file-extension counter and more.",
    category: "Shell",
    tags: ["Bash"],
    path: "Shell/Bash Scripts/",
  },
  {
    title: "Shape Hierarchy",
    description: "2D shapes built with inheritance, an interface and shared polygon math.",
    category: "Java",
    tags: ["OOP", "Interfaces"],
    path: "Java/Shape Hierarchy/",
  },
  {
    title: "Bookstore Inventory",
    description: "A bookstore inventory loaded from a file into a HashMap, with search and edits.",
    category: "Java",
    tags: ["HashMap", "File I/O"],
    path: "Java/Bookstore Inventory/",
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
    title: "Sandwich Stack",
    description: "Build a sandwich one layer at a time on a stack I wrote from scratch.",
    category: "Java",
    tags: ["Stack"],
    path: "Java/Sandwich Stack/",
  },
  {
    title: "To-Do List",
    description: "Add, insert, check off and remove tasks in the terminal.",
    category: "Java",
    tags: ["ArrayList"],
    path: "Java/To-Do List/",
  },
  {
    title: "Gradebook",
    description: "Stores grades for a class and reports averages and top scores.",
    category: "Java",
    tags: ["Arrays", "Sorting"],
    path: "Java/Gradebook/",
  },
  {
    title: "Sphere Collisions",
    description: "3D spheres that calculate their own volume and detect collisions.",
    category: "Java",
    tags: ["OOP", "Geometry"],
    path: "Java/Sphere Collisions/",
  },
  {
    title: "Morse Code Translator",
    description: "Translates text to Morse code and back.",
    category: "Python",
    tags: ["Parsing"],
    path: "Python/Morse Code Translator/",
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
    title: "Lottery Quick Pick",
    description: "Generates eight lottery tickets of six unique numbers.",
    category: "Java",
    tags: ["Loops", "Random"],
    path: "Java/Lottery Quick Pick/",
  },
  {
    title: "Grocery Checkout",
    description: "Totals a grocery order, adds bag fees and checks it against a budget.",
    category: "Java",
    tags: ["Scanner"],
    path: "Java/Grocery Checkout/",
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
  kind: "education" | "work" | "leadership" | "community";
};

export const journey: JourneyItem[] = [
  {
    period: "2025 — 2029",
    title: "B.S. Computer Science & B.S. Data Science",
    org: "Loyola University Maryland",
    place: "Baltimore, MD",
    body: "Double-majoring in computer science and data science, and building machine learning and automation projects alongside my coursework.",
    points: ["Hyman Science Scholars Program", "Alpha Kappa Psi"],
    kind: "education",
  },
  {
    period: "Summer 2026",
    title: "IT Intern",
    org: "Cabell Childress Group",
    place: "Glen Allen, VA",
    body: "Built a Python dashboard that pulls lead data from the firm's CRM API so the team can track its whole pipeline in one place. Also set up automated follow-ups and drip campaigns, and designed pages for the firm's website with custom CSS.",
    points: ["Python", "CRM API", "Marketing automation", "Squarespace + CSS"],
    kind: "work",
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
    "I like building things from scratch. Sometimes that's software, like the projects on this page, and sometimes it's a brand or a small business. The work I enjoy most is where a technical problem meets a creative one. This past summer I got to do both as an IT intern at Cabell Childress Group, building pages for the firm's website and a Python dashboard on top of its CRM.",
    "I spent three summers managing a pool and a staff of 30+ lifeguards, which taught me to stay calm under pressure and own a problem until it's solved. At Loyola, Alpha Kappa Psi has given me a community that pushes me to grow, both personally and professionally.",
    "When I'm not in class or working on something new, I'm usually on a court playing pickleball or volleyball, or volunteering with James River Greyhounds, which I've done since 2020.",
  ],
  facts: [
    { label: "Based in", value: "Baltimore, MD" },
    { label: "Studying", value: "B.S. CS + B.S. Data Science, '29" },
    { label: "Into", value: "Machine learning, automation, building products" },
    { label: "Looking for", value: "Software, data and ML internships" },
    { label: "Experience", value: "IT Intern, Cabell Childress Group" },
    { label: "Involved in", value: "Alpha Kappa Psi" },
    { label: "Off the clock", value: "Pickleball · volleyball" },
  ],
};
