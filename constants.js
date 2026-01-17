export const STREAMS = {
  SCIENCE: 'Science (PCM/B)',
  COMMERCE: 'Commerce',
  ARTS: 'Arts & Humanities',
  VOCATIONAL: 'Vocational & Technical'
};

export const MOCK_AMRATA_DATA = {
  name: "Amrata",
  stream: STREAMS.SCIENCE,
  progress: 50,
  progressDetail: "2 of 4 Levels Completed",
  monthlyStats: [40, 55, 60, 75],
  roadmap: [
      { id: 1, title: 'Foundation', desc: 'Basic concepts & terminology', completed: true },
      { id: 2, title: 'Intermediate Skills', desc: 'Core subject deep dive', completed: true },
      { id: 3, title: 'Advanced Projects', desc: 'Real-world application', completed: false },
      { id: 4, title: 'Internship Ready', desc: 'Portfolio & Interview prep', completed: false }
  ]
};

export const PSYCH_TEST_QUESTIONS = [
  {
    id: 1,
    question: "Which activity sounds more engaging?",
    options: [
      { id: 'a', icon: '🔭', text: 'Solving a complex logic puzzle', trait: 'Analytical' },
      { id: 'b', icon: '🎨', text: 'Designing a poster for an event', trait: 'Creative' }
    ]
  },
  // ... (Keep all other questions exactly as they were) ...
  {
    id: 10,
    question: "What interests you more about a car?",
    options: [
      { id: 'a', icon: '🔧', text: 'How the engine works', trait: 'Practical' },
      { id: 'b', icon: '🎨', text: 'Its aesthetic design and shape', trait: 'Creative' }
    ]
  }
];

// Note: Paste the full RECOMMENDATION_ENGINE object here
export const RECOMMENDATION_ENGINE = {
  [STREAMS.SCIENCE]: {
    description: "You have a strong analytical and logical mind...",
    courses: [
      { name: "Computer Science Engineering", suitability: "High", scholarships: "₹2L - ₹5L", duration: "4 Years", background: "Requires strong Math & Physics.", skills: "Algorithms, AI/ML." },
      // ... rest of science courses
    ],
    jobs: [
        { title: "Software Architect", salary: "₹12L - ₹30L", growth: "High (15% YoY)", desc: "Design complex software systems." },
        // ... rest of science jobs
    ],
    colleges: [
        { name: "Jadavpur University, Kolkata", fees: "₹10,000 / year", type: "Public" },
        // ... rest of colleges
    ],
    scholarships_ongoing: [
        { name: "INSPIRE Scholarship", amount: "₹80,000 / year", eligibility: "Top 1% in 12th Boards" },
        // ... rest of scholarships
    ]
  },
  // ... Copy STREAMS.COMMERCE, ARTS, VOCATIONAL data here ...
};

// Note: Paste the full ROADMAP_STEPS object here
export const ROADMAP_STEPS = [
  { 
    id: 1, 
    title: 'Foundation', 
    desc: 'Basic concepts & terminology', 
    completed: false,
    quiz: [
      { q: "What is the most important first step in career planning?", options: ["Checking Salary", "Self Assessment", "Copying Friends"], correct: "Self Assessment" },
      // ... rest of quiz
    ]
  },
  // ... Steps 2, 3, 4
];
