export type SkillCategory =
  | "Technology"
  | "Arts"
  | "Music"
  | "Cooking"
  | "Academics"
  | "Fitness"
  | "Languages";

export interface Session {
  id: string;
  title: string;
  description: string;
  skill_category: SkillCategory;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  enrolled_count: number;
  capacity: number;
  price: number;
  instructor: string;
}

export const CATEGORIES: SkillCategory[] = [
  "Technology",
  "Arts",
  "Music",
  "Cooking",
  "Academics",
  "Fitness",
  "Languages",
];

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Technology: "bg-primary/10 text-primary border-primary/20",
  Arts: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  Music: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Cooking: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  Academics: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  Fitness: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Languages: "bg-sky-500/10 text-sky-700 border-sky-500/20",
};

export const MOCK_SESSIONS: Session[] = [
  {
    id: "sess-01",
    title: "Intro to Python Programming",
    description:
      "Learn the fundamentals of Python programming from scratch. Perfect for beginners who want to start coding.",
    skill_category: "Technology",
    date: "2026-03-05",
    start_time: "14:00",
    end_time: "16:00",
    location: "Engineering Building, Room 204",
    enrolled_count: 7,
    capacity: 12,
    price: 0,
    instructor: "Alex Chen",
  },
  {
    id: "sess-02",
    title: "Watercolor Painting Basics",
    description:
      "Discover the beauty of watercolor painting. All materials provided. No experience required.",
    skill_category: "Arts",
    date: "2026-03-06",
    start_time: "10:00",
    end_time: "12:30",
    location: "Fine Arts Center, Studio B",
    enrolled_count: 5,
    capacity: 8,
    price: 15,
    instructor: "Maya Johnson",
  },
  {
    id: "sess-03",
    title: "Guitar for Beginners",
    description:
      "Pick up the guitar and learn your first chords! Bring your own guitar or borrow one from the music department.",
    skill_category: "Music",
    date: "2026-03-07",
    start_time: "17:00",
    end_time: "18:30",
    location: "Music Hall, Practice Room 3",
    enrolled_count: 4,
    capacity: 6,
    price: 10,
    instructor: "Jordan Lee",
  },
  {
    id: "sess-04",
    title: "Homemade Pasta Workshop",
    description:
      "Learn to make fresh pasta from scratch, including fettuccine and ravioli. Ingredients included in price.",
    skill_category: "Cooking",
    date: "2026-03-08",
    start_time: "11:00",
    end_time: "13:00",
    location: "Student Union Kitchen",
    enrolled_count: 10,
    capacity: 10,
    price: 20,
    instructor: "Sofia Martinez",
  },
  {
    id: "sess-05",
    title: "Calculus II Study Group",
    description:
      "Collaborative study session focused on integration techniques and series convergence. Bring your textbook.",
    skill_category: "Academics",
    date: "2026-03-05",
    start_time: "16:00",
    end_time: "18:00",
    location: "Library, Room 301",
    enrolled_count: 3,
    capacity: 15,
    price: 0,
    instructor: "Priya Patel",
  },
  {
    id: "sess-06",
    title: "React & Next.js Workshop",
    description:
      "Build modern web applications with React and Next.js. Intermediate JavaScript knowledge recommended.",
    skill_category: "Technology",
    date: "2026-03-10",
    start_time: "13:00",
    end_time: "16:00",
    location: "Tech Hub, Lab 102",
    enrolled_count: 9,
    capacity: 15,
    price: 0,
    instructor: "Sam Nguyen",
  },
  {
    id: "sess-07",
    title: "Yoga & Mindfulness",
    description:
      "A relaxing session combining yoga stretches with mindfulness meditation. Bring a yoga mat if you have one.",
    skill_category: "Fitness",
    date: "2026-03-09",
    start_time: "07:00",
    end_time: "08:00",
    location: "Recreation Center, Studio A",
    enrolled_count: 8,
    capacity: 20,
    price: 5,
    instructor: "Lily Chang",
  },
  {
    id: "sess-08",
    title: "Conversational Spanish",
    description:
      "Practice speaking Spanish in a relaxed, immersive environment. All levels welcome.",
    skill_category: "Languages",
    date: "2026-03-11",
    start_time: "18:00",
    end_time: "19:30",
    location: "Humanities Building, Room 110",
    enrolled_count: 6,
    capacity: 12,
    price: 0,
    instructor: "Diego Ramirez",
  },
  {
    id: "sess-09",
    title: "Digital Illustration with Procreate",
    description:
      "Create stunning digital artwork on iPad. iPads will be provided for the session.",
    skill_category: "Arts",
    date: "2026-03-12",
    start_time: "14:00",
    end_time: "16:00",
    location: "Design Studio, Room 205",
    enrolled_count: 6,
    capacity: 8,
    price: 12,
    instructor: "Kai Williams",
  },
];
