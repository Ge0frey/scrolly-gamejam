## Link: https://deeptypeworld.vercel.app/

#  Deep Type

An underwater typing game where you race against time to type falling letters before they hit the ocean floor!

##  How to Play

- **Objective:** Survive 30 seconds by typing letters before they sink to the bottom
- **Controls:** Use your keyboard or tap the on-screen virtual keyboard
- **Win:** Survive the full 30 seconds with at least 1 life remaining
- **Lose:** Run out of all 5 lives before time expires

## 🌊 Game Elements

| Element | Description |
|---------|-------------|
| **Normal Letters** | Type to score 1 point |
| **Golden Letters** ✨ | Type to score 3 points (glowing amber) |
| **Sea Urchins** 🦔 | Avoid typing these - instant game over! |

## ⚡ Features

- **30-Second Challenge** - Progressive difficulty that increases as time runs out
- **Combo System** - Chain correct letters for score multipliers (up to 5x)
- **5 Lives** ❤️ - Lose a life when a letter hits the ocean floor
- **Power-ups** - Randomly appearing bonuses:
  - 🐢 **Slow Current** - Slows falling letters
  - 🐚 **Shell Shield** - Protects against missed letters
- **Sound Effects** - Audio feedback for pops, combos, and misses
- **High Score** - Your best score is saved locally
- **Mobile Friendly** - Virtual keyboard for touch devices

##  Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play!

##  Tech Stack

- **Next.js** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Web Audio API** - Sound effects

##  Project Structure

```
├── src/
│   ├── views/
│   │   └── home/
│   │       └── index.tsx    # Main game component (GameSandbox)
│   ├── components/          # Reusable UI components
│   ├── pages/               # Next.js pages
│   └── styles/              # Global styles
├── public/                  # Static assets
└── package.json
```

##  Game Tips

1. Focus on letters closest to the bottom first
2. Build combos for higher multipliers
3. Watch out for sea urchins - don't type them!
4. The game speeds up in the final seconds - stay focused!

---

Built for the Scrolly Game Jam 🫧
