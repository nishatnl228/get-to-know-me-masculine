# ⚡ RYAN — Premium Personal Website
## Setup & Editing Guide

---

## 📁 File Structure
```
boyfriend-site/
├── index.html        ← Homepage / Mode Select
├── garage.html       ← Cars / Dream Garage
├── sports.html       ← Match Day / Sports
├── studio.html       ← Studio / Music
├── travel.html       ← Travel Destinations
├── profile.html      ← Profile / Stats Dashboard
├── highlights.html   ← Highlights / Achievements
│
├── shared.css        ← ALL shared styles (theme, nav, cards, modals)
├── scripts.js        ← ALL shared JavaScript (particles, modals, audio)
├── data.js           ← ⭐ ALL YOUR CONTENT — EDIT THIS FILE
└── README.md         ← This file
```

---

## ✏️ How to Edit Content

**Open `data.js`** — this is where ALL your content lives.

### Change his name everywhere:
- Edit the `<title>` tags in each HTML file
- Edit the `.nav-logo` text in each HTML file (search for "RYAN")
- Edit `profileData.name` in data.js

### Add / edit cars (Garage):
```js
garageItems = [
  {
    name: "Car Name",
    brand: "Brand",
    tag: "Your tag",
    coverImage: "path/to/image.jpg",   // ← your image
    dreamColor: "Color name",
    year: "2024",
    horsepower: "500 HP",
    topSpeed: "300 km/h",
    drivetrain: "RWD",
    bodyType: "Coupe",
    whyILoveIt: "Your story...",
    engineSound: "audio/car.mp3",      // ← optional engine sound file
  }
]
```

### Add / edit sports:
```js
sportsItems = [
  {
    name: "Sport Name",
    subtitle: "Position",
    rating: 90,                        // ← out of 99
    coverImage: "path/to/image.jpg",
    stats: [
      { label: "Speed", value: 88 },   // ← each stat 0-99
    ],
    memories: "Your memory note...",
    photos: ["photo1.jpg", "photo2.jpg"]
  }
]
```

### Add / edit music:
```js
studioItems = [
  {
    title: "Track Title",
    category: "Category",
    mood: "Mood",
    coverImage: "path/to/cover.jpg",
    audioFile: "audio/track.mp3",      // ← your audio file
    description: "Description..."
  }
]
```

### Add / edit travel destinations:
```js
travelItems = [
  {
    place: "City Name",
    country: "Country",
    year: "2024",
    tags: ["City", "Food"],
    coverImage: "path/to/image.jpg",
    note: "Your trip note...",
    favoriteMoment: "Best moment...",
    bestFood: "Best food...",
    revisit: true,
    photos: ["photo1.jpg"]
  }
]
```

### Edit profile stats:
In `data.js` → `profileData.stats` → change labels and values (0–100).

### Edit achievements:
In `data.js` → `highlightsData` → change icon, title, subtitle, description, rarity.
Rarity options: `"Legendary"`, `"Epic"`, `"Rare"`, `"Common"`

---

## 🖼️ Adding Images

**Option A — Use a URL:**
```js
coverImage: "https://images.unsplash.com/photo-XXXXX?w=800&q=80"
```

**Option B — Use local files:**
1. Create an `images/` folder next to the HTML files
2. Drop your images in there
3. Reference them like:
```js
coverImage: "images/my-car.jpg"
```

---

## 🔊 Adding Audio

1. Create an `audio/` folder
2. Put your `.mp3` files there
3. Reference in data.js:
```js
// For cars:
engineSound: "audio/porsche-gt3.mp3"

// For music:
audioFile: "audio/vocals.mp3"
```

---

## 🎨 Changing the Color Theme

Open `shared.css` → find `:root { ... }` at the top.
Change `--blue-core` to any color to retheme the entire site.

---

## 🚀 Hosting

To put this online:
1. Upload all files to any static host (Netlify, Vercel, GitHub Pages)
2. Make sure all images and audio files are included
3. No server or backend needed — it's 100% front-end

---

Made with ❤️ — a personalized universe.
