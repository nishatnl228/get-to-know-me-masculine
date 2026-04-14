/**
 * ============================================================
 *  DATA.JS — EDIT ALL YOUR CONTENT HERE
 *  Each section has its own array. Add, remove, or modify items.
 *  Images: use a URL or a relative path like "images/mycar.jpg"
 * ============================================================
 */

// ─── PROFILE ─────────────────────────────────────────────────
const profileData = {
  name: "Injamam",                          // ← Change name
  nickname: "The One",                   // ← Change nickname
  tagline: "Car Enthusiast. Athlete. Artist. Explorer. And More",
  bio: "A man of many worlds — equally at home behind the wheel, on the pitch, on stage, or crossing borders. This is my universe.",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", // ← Replace with his photo
  favoriteTeam: "Real Madrid",           // ← Edit
  favoriteCar: "Porsche 911 GT3",        // ← Edit
  favoriteGenre: "R&B / Soul",           // ← Edit
  favoritePlace: "Bangladesh",               // ← Edit
  favoriteQuote: "\"The road doesn't care about your excuses.\"", // ← Edit
  stats: [
    { label: "Speed",          value: 92 },
    { label: "Stamina",        value: 88 },
    { label: "Stage Presence", value: 95 },
    { label: "Discipline",     value: 84 },
    { label: "Charisma",       value: 97 },
    { label: "Confidence",     value: 91 },
    { label: "Loyalty",        value: 99 },
    { label: "Style",          value: 96 },
  ]
};

// ─── GARAGE / CARS ───────────────────────────────────────────
const garageItems = [
  {
    id: "car1",
    name: "Porsche 911 GT3",             // ← Car name
    brand: "Porsche",                    // ← Brand
    tag: "Ultimate Favorite",            // ← Tag label
    coverImage: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80", // ← Cover image
    dreamColor: "Guards Red",
    year: "2023",
    horsepower: "503 HP",
    topSpeed: "320 km/h",
    drivetrain: "RWD",
    bodyType: "Coupe",
    whyILoveIt: "The GT3 is pure driving perfection. Naturally aspirated flat-six, rear-wheel drive, and a soundtrack that gives goosebumps every single time.",
    engineSound: "",                     // ← Optional: path to engine sound mp3
    extraImages: [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
    ]
  },
  {
    id: "car2",
    name: "BMW M4 Competition",
    brand: "BMW",
    tag: "Track Beast",
    coverImage: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
    dreamColor: "Isle of Man Green",
    year: "2024",
    horsepower: "510 HP",
    topSpeed: "290 km/h",
    drivetrain: "AWD / RWD",
    bodyType: "Coupe",
    whyILoveIt: "Aggressive, sharp, and uncompromisingly driver-focused. The M4 is the kind of car that makes every road feel like a racetrack.",
    engineSound: "",
    extraImages: []
  },
  {
    id: "car3",
    name: "Mercedes-AMG GT",
    brand: "Mercedes",
    tag: "Dream Daily",
    coverImage: "https://images.unsplash.com/photo-1622175836062-5e053779ef7d?w=800&q=80",
    dreamColor: "Obsidian Black",
    year: "2023",
    horsepower: "577 HP",
    topSpeed: "315 km/h",
    drivetrain: "RWD",
    bodyType: "Roadster",
    whyILoveIt: "The AMG GT is what happens when Mercedes stops being polite and starts being serious. Brutal power, elegant lines.",
    engineSound: "",
    extraImages: []
  },
];

// ─── SPORTS ──────────────────────────────────────────────────
const sportsItems = [
  {
    id: "sport1",
    name: "Football",                    // ← Sport name
    subtitle: "Central Midfielder",      // ← Position or subtitle
    rating: 87,                          // ← Rating out of 99
    coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80", // ← Cover
    stats: [
      { label: "Pace",      value: 85 },
      { label: "Shooting",  value: 80 },
      { label: "Passing",   value: 90 },
      { label: "Dribbling", value: 83 },
      { label: "Defense",   value: 74 },
      { label: "Physical",  value: 88 },
    ],
    memories: "Best feeling is scoring in a close game — that rush is unmatched.",
    photos: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    ]
  },
  {
    id: "sport2",
    name: "Basketball",
    subtitle: "Point Guard",
    rating: 82,
    coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    stats: [
      { label: "Speed",     value: 88 },
      { label: "Shooting",  value: 79 },
      { label: "Playmaking",value: 91 },
      { label: "Defense",   value: 76 },
      { label: "Stamina",   value: 85 },
      { label: "IQ",        value: 90 },
    ],
    memories: "Reading the court and making the right play at the right moment — that's everything.",
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    ]
  },
  {
    id: "sport3",
    name: "Running",
    subtitle: "Distance & Sprints",
    rating: 90,
    coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    stats: [
      { label: "Endurance", value: 93 },
      { label: "Speed",     value: 87 },
      { label: "Form",      value: 89 },
      { label: "Recovery",  value: 85 },
      { label: "Mental",    value: 92 },
      { label: "Pace",      value: 88 },
    ],
    memories: "That moment when your legs give out but your mind pushes you across the finish line.",
    photos: []
  },
];

// ─── STUDIO / MUSIC ──────────────────────────────────────────
const studioItems = [
  {
    id: "music1",
    title: "Vocals",                     // ← Title
    category: "Original & Covers",      // ← Category
    mood: "Soulful",                     // ← Mood label
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", // ← Cover art
    audioFile: "",                       // ← Path to audio file: "audio/vocals.mp3"
    description: "Raw, expressive, and full of feeling. Every performance is a story.",
  },
  {
    id: "music2",
    title: "Guitar",
    category: "Acoustic Sessions",
    mood: "Chill",
    coverImage: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    audioFile: "",
    description: "Late nights, a guitar, and a melody that says everything words can't.",
  },
  {
    id: "music3",
    title: "Piano",
    category: "Originals",
    mood: "Cinematic",
    coverImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    audioFile: "",
    description: "Classical instincts meeting modern emotion. Each key stroke is intentional.",
  },
  {
    id: "music4",
    title: "Studio Mix",
    category: "Production",
    mood: "High Energy",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    audioFile: "",
    description: "Layers of sound built from scratch — this is where ideas become something real.",
  },
];

// ─── TRAVEL ──────────────────────────────────────────────────
const travelItems = [
  {
    id: "travel1",
    place: "Tokyo",                      // ← Place name
    country: "Japan",                    // ← Country / City
    year: "2023",                        // ← Year
    tags: ["City", "Culture", "Food"],   // ← Tags
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", // ← Cover
    note: "Tokyo is like nowhere else on Earth. The energy, the food, the precision — completely unforgettable.",
    favoriteMoment: "Watching the city light up from the Tokyo Skytree at night.",
    bestFood: "Wagyu ramen at midnight in Shinjuku.",
    revisit: true,
    photos: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    ]
  },
  {
    id: "travel2",
    place: "Dubai",
    country: "UAE",
    year: "2022",
    tags: ["Luxury", "City", "Adventure"],
    coverImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    note: "Where ambition meets architecture. Dubai doesn't dream small.",
    favoriteMoment: "Desert safari at sunset — absolute silence in the middle of everything.",
    bestFood: "Grilled hammour fish on the waterfront.",
    revisit: true,
    photos: []
  },
  {
    id: "travel3",
    place: "Barcelona",
    country: "Spain",
    year: "2023",
    tags: ["Coastal", "Football", "Food"],
    coverImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    note: "Football, architecture, and the best food in Europe. Barcelona just hits different.",
    favoriteMoment: "Watching a match at Camp Nou — the atmosphere is electric.",
    bestFood: "Pan con tomate at a small tapas bar in El Born.",
    revisit: true,
    photos: []
  },
];

// ─── HIGHLIGHTS / ACHIEVEMENTS ───────────────────────────────
const highlightsData = [
  {
    icon: "🏆",
    title: "Tournament Champion",
    subtitle: "Sports",
    description: "Led the team to victory in the regional football tournament.",
    rarity: "Legendary",                 // ← Legendary / Epic / Rare / Common
  },
  {
    icon: "🎤",
    title: "Stage Ready",
    subtitle: "Music",
    description: "First live performance in front of a crowd — owned every second.",
    rarity: "Epic",
  },
  {
    icon: "✈️",
    title: "World Traveler",
    subtitle: "Travel",
    description: "Visited 10+ countries across 4 continents.",
    rarity: "Epic",
  },
  {
    icon: "🚗",
    title: "Petrolhead",
    subtitle: "Cars",
    description: "Encyclopedic knowledge of anything with an engine.",
    rarity: "Rare",
  },
  {
    icon: "⚡",
    title: "Unbreakable",
    subtitle: "Character",
    description: "Shows up, every single time, no matter what.",
    rarity: "Legendary",
  },
  {
    icon: "🎯",
    title: "Precision",
    subtitle: "Focus",
    description: "When he's locked in, nothing can stop him.",
    rarity: "Epic",
  },
  {
    icon: "🎸",
    title: "Natural Talent",
    subtitle: "Music",
    description: "Picked up a guitar and never looked back.",
    rarity: "Rare",
  },
  {
    icon: "👑",
    title: "Main Character",
    subtitle: "Life",
    description: "Walks into any room and owns it without trying.",
    rarity: "Legendary",
  },
];
