// Next, React
import { FC, useState, useEffect, useCallback, useRef } from 'react';
import pkg from '../../../package.json';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-teal-950 text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-teal-800/30 py-3 bg-teal-900/40">
        <div className="flex items-center gap-2 rounded-full bg-teal-800/30 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-teal-700/60 px-3 py-1 font-semibold text-teal-100">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-teal-400/60">
            Casino
          </button>
          <button className="rounded-full px-3 py-1 text-teal-400/60">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border-2 border-teal-600/20 shadow-lg">
          {/* Fake "feed card" top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-teal-300/70 bg-teal-900/60 backdrop-blur-sm relative z-10">
            <span className="rounded-full bg-teal-700/40 px-2 py-1 text-[9px] uppercase tracking-wide text-teal-200">
              🐠 Scrolly Game
            </span>
            <span className="text-[9px] text-teal-400/50">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-teal-800/30 px-2 text-[9px] text-teal-500/60">
        <span>🫧 Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};

// ✅ THIS IS THE ONLY PART YOU EDIT FOR THE JAM
// Replace this entire GameSandbox component with the one AI generates.
// Keep the name `GameSandbox` and the `FC` type.

interface FallingLetter {
  id: string;
  letter: string;
  x: number;
  y: number;
  speed: number;
  type: 'normal' | 'golden' | 'bomb';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  type: 'sparkle' | 'bubble' | 'ring';
}

interface Bubble {
  id: string;
  x: number;
  size: number;
  speed: number;
  delay: number;
}

// Generate static bubbles once (using useMemo pattern outside component to avoid re-renders)
const staticBubbles: Bubble[] = Array.from({ length: 12 }, (_, i) => ({
  id: `bubble-static-${i}-${Math.random().toString(36).substring(2, 9)}`,
  x: 5 + (i * 8) % 90,
  size: 4 + (i % 4) * 3,
  speed: 3 + (i % 3) * 2,
  delay: i * 0.8,
}));

// Seaweed positions with unique keys
const seaweedData = [
  { id: 'sw-1', pos: 8 },
  { id: 'sw-2', pos: 22 },
  { id: 'sw-3', pos: 38 },
  { id: 'sw-4', pos: 55 },
  { id: 'sw-5', pos: 72 },
  { id: 'sw-6', pos: 88 },
];

// Virtual keyboard layout - 3 rows like a QWERTY keyboard
const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

// Simple audio context for sound effects
const playSound = (type: 'pop' | 'golden' | 'miss' | 'bomb' | 'combo') => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'pop':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'golden':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'miss':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'bomb':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'combo':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
    }
  } catch {
    // Audio not available
  }
};

const GameSandbox: FC = () => {
  // Game states
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastTyped, setLastTyped] = useState<{ letter: string; correct: boolean } | null>(null);
  const [powerUp, setPowerUp] = useState<'none' | 'slow' | 'shield'>('none');
  const [screenShake, setScreenShake] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'none' | 'success' | 'fail' | 'golden'>('none');
  const [timeLeft, setTimeLeft] = useState(30);
  const [didWin, setDidWin] = useState(false);

  // Game duration constant
  const GAME_DURATION = 30;

  // Calculate difficulty based on time elapsed (0-30 seconds maps to difficulty 0-15)
  const timeElapsed = GAME_DURATION - timeLeft;
  const difficulty = Math.min(Math.floor(timeElapsed / 2), 15);
  // Speed increases as time runs out: starts slow, ends fast
  const baseFallSpeed = 1.5 + (timeElapsed / GAME_DURATION) * 3.0; // 1.5 to 4.5
  const spawnRate = Math.max(400, 1500 - timeElapsed * 40); // 1500ms down to 400ms

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('letterRainHighScore');
      if (saved) setHighScore(parseInt(saved));
    } catch {
      // localStorage not available
    }
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('letterRainHighScore', score.toString());
      } catch {
        // localStorage not available
      }
    }
  }, [score, highScore]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setDidWin(true); // Survived the full 30 seconds = WIN!
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Refs for spawn timing (to avoid interval reset issues)
  const lastSpawnTimeRef = useRef(0);
  const gameStateRef = useRef(gameState);
  const timeLeftRef = useRef(timeLeft);
  const powerUpRef = useRef(powerUp);
  const scoreRef = useRef(score);

  // Keep refs in sync
  useEffect(() => {
    gameStateRef.current = gameState;
    timeLeftRef.current = timeLeft;
    powerUpRef.current = powerUp;
    scoreRef.current = score;
  }, [gameState, timeLeft, powerUp, score]);

  // Spawn new letters using fixed interval with dynamic timing
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Reset spawn time when game starts
    lastSpawnTimeRef.current = Date.now();

    const checkAndSpawn = () => {
      if (gameStateRef.current !== 'playing') return;

      const now = Date.now();
      const elapsed = GAME_DURATION - timeLeftRef.current;
      // Calculate current spawn rate based on time elapsed
      const currentSpawnRate = Math.max(400, 1200 - elapsed * 30); // 1200ms down to 400ms
      
      if (now - lastSpawnTimeRef.current >= currentSpawnRate) {
        lastSpawnTimeRef.current = now;

        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const x = 10 + Math.random() * 80;

        let type: 'normal' | 'golden' | 'bomb' = 'normal';
        const rand = Math.random();
        if (scoreRef.current > 5 && rand > 0.97) type = 'bomb';
        else if (rand > 0.88) type = 'golden';

        const speedMultiplier = powerUpRef.current === 'slow' ? 0.4 : 1;
        const currentFallSpeed = 1.5 + (elapsed / GAME_DURATION) * 3.0;

        setFallingLetters((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            letter: randomLetter,
            x,
            y: -5,
            speed: currentFallSpeed * speedMultiplier * (0.8 + Math.random() * 0.4),
            type,
          },
        ]);
      }
    };

    // Spawn first letter immediately
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setFallingLetters([{
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      letter: randomLetter,
      x: 10 + Math.random() * 80,
      y: -5,
      speed: 1.5 * (0.8 + Math.random() * 0.4),
      type: 'normal',
    }]);

    // Check frequently but spawn based on dynamic rate
    const interval = setInterval(checkAndSpawn, 100);
    return () => clearInterval(interval);
  }, [gameState]);

  // Game loop - update letter positions
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setFallingLetters((prev) => {
        let lostLife = false;

        const updated = prev
          .map((letter) => ({
            ...letter,
            y: letter.y + letter.speed,
          }))
          .filter((letter) => {
            if (letter.y >= 95) {
              if (powerUp !== 'shield') {
                lostLife = true;
              }
              return false;
            }
            return true;
          });

        if (lostLife) {
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setDidWin(false); // Lost all lives = LOSE
              setTimeout(() => setGameState('gameover'), 100);
            }
            return Math.max(0, newLives);
          });
          setCombo(0);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 150);
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, powerUp]);

  // Letter input handler - works for both keyboard and touch
  const handleLetterInput = useCallback(
    (typed: string) => {
      if (gameState !== 'playing') return;
      if (!/^[A-Z]$/.test(typed)) return;

      setFallingLetters((prev) => {
        const matchingLetters = prev.filter((l) => l.letter === typed);

        if (matchingLetters.length === 0) {
          setLastTyped({ letter: typed, correct: false });
          setCombo(0);
          setScreenFlash('fail');
          playSound('miss');
          setTimeout(() => setScreenFlash('none'), 150);
          setTimeout(() => setLastTyped(null), 250);
          return prev;
        }

        // Get the lowest matching letter (closest to danger zone)
        const target = matchingLetters.reduce((a, b) => (a.y > b.y ? a : b));

        // Handle bomb - instant game over!
        if (target.type === 'bomb') {
          setScreenShake(true);
          setScreenFlash('fail');
          playSound('bomb');
          setTimeout(() => {
            setLives(0);
            setDidWin(false); // Hit a bomb = LOSE
            setGameState('gameover');
            setScreenShake(false);
            setScreenFlash('none');
          }, 300);
          return prev;
        }

        // Award points with combo multiplier
        const basePoints = target.type === 'golden' ? 3 : 1;
        const comboMultiplier = Math.min(5, Math.floor(combo / 3) + 1);
        setScore((s) => s + basePoints * comboMultiplier);
        setCombo((c) => c + 1);

        // Play sound effect
        if (target.type === 'golden') {
          playSound('golden');
          setScreenFlash('golden');
        } else {
          playSound('pop');
          setScreenFlash('success');
        }
        setTimeout(() => setScreenFlash('none'), 100);

        // Play combo sound for high combos
        if (combo > 0 && combo % 3 === 2) {
          setTimeout(() => playSound('combo'), 50);
        }

        // Create explosion particles with physics
        const particleColors =
          target.type === 'golden'
            ? ['#f59e0b', '#fbbf24', '#fcd34d', '#fde047']
            : ['#06b6d4', '#14b8a6', '#2dd4bf', '#5eead4'];

        const particleTimestamp = Date.now();
        const particleRandom = Math.random().toString(36).substring(2, 9);
        
        // Create multiple types of particles for richer effect
        const sparkles: Particle[] = Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const speed = 2 + Math.random() * 3;
          return {
            id: `sparkle-${particleTimestamp}-${particleRandom}-${i}`,
            x: target.x,
            y: target.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: particleColors[Math.floor(Math.random() * particleColors.length)],
            size: 4 + Math.random() * 4,
            life: 1,
            type: 'sparkle' as const,
          };
        });

        // Add ring effect for golden letters
        const rings: Particle[] = target.type === 'golden' ? [{
          id: `ring-${particleTimestamp}-${particleRandom}`,
          x: target.x,
          y: target.y,
          vx: 0,
          vy: 0,
          color: '#fbbf24',
          size: 10,
          life: 1,
          type: 'ring' as const,
        }] : [];

        // Add rising bubbles
        const bubbles: Particle[] = Array.from({ length: 3 }, (_, i) => ({
          id: `bubble-pop-${particleTimestamp}-${particleRandom}-${i}`,
          x: target.x + (Math.random() - 0.5) * 15,
          y: target.y,
          vx: (Math.random() - 0.5) * 1,
          vy: -1 - Math.random() * 2,
          color: 'rgba(255,255,255,0.6)',
          size: 3 + Math.random() * 4,
          life: 1,
          type: 'bubble' as const,
        }));

        const newParticles = [...sparkles, ...rings, ...bubbles];
        setParticles((p) => [...p, ...newParticles]);

        setLastTyped({ letter: typed, correct: true });
        setTimeout(() => setLastTyped(null), 200);

        return prev.filter((l) => l.id !== target.id);
      });
    },
    [gameState, combo]
  );

  // Keyboard input handler (wraps handleLetterInput)
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      handleLetterInput(e.key.toUpperCase());
    },
    [handleLetterInput]
  );

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Power-up timer
  useEffect(() => {
    if (powerUp === 'none') return;
    const timer = setTimeout(() => setPowerUp('none'), 6000);
    return () => clearTimeout(timer);
  }, [powerUp]);

  // Spawn power-ups occasionally
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnPowerUp = () => {
      if (Math.random() > 0.25 || powerUp !== 'none') return;
      const powerUps: Array<'slow' | 'shield'> = ['slow', 'shield'];
      setPowerUp(powerUps[Math.floor(Math.random() * powerUps.length)]);
    };

    const interval = setInterval(spawnPowerUp, 12000);
    return () => clearInterval(interval);
  }, [gameState, powerUp]);

  // Particle physics update loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const updateParticles = setInterval(() => {
      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            vy: p.type === 'bubble' ? p.vy : p.vy + 0.1, // gravity for non-bubbles
            life: p.life - 0.05,
            size: p.type === 'ring' ? p.size + 2 : p.size * 0.95,
          }))
          .filter((p) => p.life > 0 && p.size > 0.5);
      });
    }, 30);

    return () => clearInterval(updateParticles);
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(5);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setDidWin(false);
    setFallingLetters([]);
    setParticles([]);
    setPowerUp('none');
    setLastTyped(null);
  };

  const getLetterStyle = (type: 'normal' | 'golden' | 'bomb') => {
    switch (type) {
      case 'golden':
        return 'text-amber-100 bg-amber-500/50 border-amber-300/70 shadow-lg shadow-amber-500/40';
      case 'bomb':
        return 'text-rose-100 bg-rose-600/50 border-rose-400/70 shadow-lg shadow-rose-500/40';
      default:
        return 'text-teal-100 bg-teal-500/40 border-teal-300/60 shadow-md shadow-teal-500/30';
    }
  };

  const comboMultiplier = Math.min(5, Math.floor(combo / 3) + 1);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none`}
      style={{
        transform: screenShake ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px) rotate(${Math.random() * 2 - 1}deg)` : 'none',
        background: 'linear-gradient(180deg, #042633 0%, #0a3342 30%, #0c8074 70%, #0d4f4a 100%)',
        transition: screenShake ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      {/* Screen flash overlay */}
      {screenFlash !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-100"
          style={{
            backgroundColor: 
              screenFlash === 'success' ? 'rgba(20, 184, 166, 0.35)' :
              screenFlash === 'golden' ? 'rgba(245, 158, 11, 0.45)' :
              screenFlash === 'fail' ? 'rgba(220, 38, 38, 0.4)' : 'transparent',
          }}
        />
      )}

      {/* Underwater ambient - light rays from surface */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={`light-ray-${i}`}
            className="absolute top-0 opacity-[0.12]"
            style={{
              left: `${20 + i * 25}%`,
              width: '60px',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
              transform: `skewX(${-15 + i * 10}deg)`,
            }}
          />
        ))}
      </div>

      {/* Rising bubbles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {staticBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/30 border border-white/50"
            style={{
              left: `${bubble.x}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `rise ${bubble.speed}s ease-in-out infinite`,
              animationDelay: `${bubble.delay}s`,
              boxShadow: '0 0 8px rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* CSS Animation for bubbles */}
      <style>{`
        @keyframes rise {
          0% { bottom: -20px; opacity: 0; transform: translateX(0); }
          10% { opacity: 0.9; }
          90% { opacity: 0.7; }
          100% { bottom: 100%; opacity: 0; transform: translateX(10px); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>

      {/* HUD - Score, Combo, Lives */}
      <div className="flex justify-between items-start px-3 pt-2 pb-1 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white drop-shadow-lg">
              {score}
            </span>
            {combo >= 3 && (
              <span className="text-[10px] font-bold text-amber-100 animate-pulse px-1.5 py-0.5 rounded-full bg-amber-500/40 border border-amber-300/60 shadow-lg">
                {comboMultiplier}x
              </span>
            )}
          </div>
          <span className="text-[9px] text-teal-200/80 drop-shadow">Best: {highScore}</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={`life-${i}`}
              className={`text-sm transition-all duration-200 ${
                i < lives 
                  ? 'opacity-100 drop-shadow-lg' 
                  : 'opacity-30 grayscale'
              }`}
              style={{ filter: i < lives ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))' : 'none' }}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Power-up indicator */}
      {powerUp !== 'none' && (
        <div
          className={`absolute top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-medium z-20 border shadow-lg ${
            powerUp === 'slow' 
              ? 'bg-sky-600/50 text-sky-100 border-sky-300/60 shadow-sky-500/50' 
              : 'bg-emerald-600/50 text-emerald-100 border-emerald-300/60 shadow-emerald-500/50'
          }`}
        >
          {powerUp === 'slow' ? '🐢 Slow Current' : '🐚 Shell Shield'}
        </div>
      )}

      {/* Timer countdown */}
      {gameState === 'playing' && (
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-bold z-20 border shadow-lg ${
          timeLeft <= 5 
            ? 'bg-rose-600/60 text-rose-100 border-rose-300/60 animate-pulse' 
            : timeLeft <= 10 
              ? 'bg-amber-600/50 text-amber-100 border-amber-300/60' 
              : 'bg-teal-700/50 text-teal-100 border-teal-300/50'
        }`}>
          <span className="text-sm">⏱️ {timeLeft}s</span>
        </div>
      )}

      {/* Game Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Particles with different effects */}
        {particles.map((p) => {
          if (p.type === 'ring') {
            return (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid ${p.color}`,
                  opacity: p.life,
                }}
              />
            );
          }
          if (p.type === 'bubble') {
            return (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: p.color,
                  opacity: p.life * 0.6,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            );
          }
          // Sparkle particle
          return (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
              }}
            />
          );
        })}

        {/* Falling letters (like sinking objects) */}
        {fallingLetters.map((letter) => {
          const style = getLetterStyle(letter.type);
          return (
            <div
              key={letter.id}
              className={`absolute flex items-center justify-center w-9 h-9 rounded-xl font-bold text-lg border transition-none ${style} ${
                letter.type === 'golden' ? 'animate-pulse' : ''
              } ${letter.type === 'bomb' ? 'animate-bounce' : ''}`}
              style={{
                left: `${letter.x}%`,
                top: `${letter.y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              {letter.type === 'bomb' ? '🦔' : letter.letter}
            </div>
          );
        })}

        {/* Ocean floor - sandy bottom with seaweed */}
        <div className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none">
          {/* Sandy gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, #7a5c1f 0%, #96721c 40%, transparent 100%)',
              opacity: 0.8,
            }}
          />
          
          {/* Seaweed */}
          {seaweedData.map((sw, i) => (
            <div
              key={sw.id}
              className="absolute bottom-0"
              style={{
                left: `${sw.pos}%`,
                transformOrigin: 'bottom center',
                animation: `sway ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <svg width="20" height={35 + (i % 3) * 10} viewBox="0 0 20 50" fill="none">
                <path
                  d={`M10 50 Q${5 + (i % 2) * 10} 35 10 25 Q${15 - (i % 2) * 10} 15 10 0`}
                  stroke={i % 2 === 0 ? '#14532d' : '#15803d'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
              </svg>
            </div>
          ))}

          {/* Small shells and pebbles */}
          <div className="absolute bottom-1 left-[15%] text-[10px]">🐚</div>
          <div className="absolute bottom-2 left-[45%] text-[8px]">⚪</div>
          <div className="absolute bottom-1 left-[75%] text-[10px]">🪨</div>
        </div>
      </div>

      {/* Input feedback */}
      {lastTyped && (
        <div
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 text-3xl font-black transition-all duration-100 z-30 ${
            lastTyped.correct ? 'scale-125 text-emerald-300' : 'scale-90 text-rose-300'
          }`}
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}
        >
          {lastTyped.letter}
        </div>
      )}

      {/* Virtual keyboard - always visible */}
      {gameState === 'playing' && (
        <div className="bg-teal-900/80 backdrop-blur-sm px-1 pb-4 pt-3 relative z-10 rounded-t-xl shadow-2xl">
          <div className="flex flex-col gap-1.5 items-center">
            {keyboardRows.map((row, rowIndex) => (
              <div key={`kb-row-${rowIndex}`} className="flex gap-1 justify-center">
                {row.map((letter) => (
                  <button
                    key={`kb-${letter}`}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleLetterInput(letter);
                    }}
                    onClick={() => handleLetterInput(letter)}
                    className="w-8 h-9 rounded-lg bg-teal-600/60 border border-teal-300/50 text-teal-50 font-bold text-sm shadow-md
                      active:bg-teal-400/80 active:scale-95 active:shadow-lg transition-all duration-75
                      hover:bg-teal-500/70 hover:border-teal-200/60 select-none touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-950/95 backdrop-blur-sm z-50">
          <div className="text-3xl mb-1 drop-shadow-lg">🐠</div>
          <div className="text-2xl font-black text-white mb-1 tracking-tight drop-shadow-lg">
            DEEP TYPE
          </div>
          <p className="text-[11px] text-teal-200 mb-4 drop-shadow">
            Tap or type letters before they hit the ocean floor!
          </p>

          <div className="text-[10px] text-teal-100 mb-5 space-y-2 text-center px-6">
            <div className="flex items-center justify-center gap-3 bg-teal-800/50 rounded-lg px-4 py-2 shadow-lg border border-teal-600/40">
              <span className="w-7 h-7 rounded-lg bg-teal-500/40 border border-teal-300/60 flex items-center justify-center text-teal-50 font-bold shadow-md">A</span>
              <span className="text-teal-100">Normal = 1pt</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-amber-900/40 rounded-lg px-4 py-2 shadow-lg border border-amber-600/40">
              <span className="w-7 h-7 rounded-lg bg-amber-500/50 border border-amber-300/70 flex items-center justify-center text-amber-50 font-bold animate-pulse shadow-lg">G</span>
              <span className="text-amber-100">Golden = 3pts</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-rose-900/40 rounded-lg px-4 py-2 shadow-lg border border-rose-600/40">
              <span className="text-base drop-shadow-lg">🦔</span>
              <span className="text-rose-100">Sea Urchin = Game Over!</span>
            </div>
          </div>

          <div className="text-xs text-teal-100 mb-5 text-center drop-shadow">
            ⏱️ 30 seconds to score as much as you can!<br/>
            🌊 Speed increases as time runs out!
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 border border-teal-300/50 shadow-xl shadow-teal-600/50"
          >
            🫧 DIVE IN
          </button>

          {highScore > 0 && (
            <p className="text-[10px] text-teal-200 mt-4 drop-shadow">
              🏆 High Score: <span className="text-amber-300 font-bold">{highScore}</span>
            </p>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-950/95 backdrop-blur-sm z-50">
          <div className="text-4xl mb-2 drop-shadow-lg">{didWin ? '🏆' : '🌊'}</div>
          <div className={`text-xl font-black mb-3 drop-shadow-lg ${didWin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {didWin ? 'YOU WIN!' : 'GAME OVER'}
          </div>
          {!didWin && (
            <p className="text-[11px] text-rose-300 mb-2 drop-shadow">YOU LOST</p>
          )}
          {didWin && (
            <p className="text-[11px] text-emerald-300 mb-2 drop-shadow">You survived 30 seconds!</p>
          )}

          <div className="text-4xl font-black text-white mb-1 drop-shadow-lg">
            {score}
          </div>
          <p className="text-[11px] text-teal-200 mb-3 drop-shadow">POINTS</p>

          {score >= highScore && score > 0 && (
            <div className="text-xs font-bold text-amber-100 mb-4 px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-300/50 animate-pulse shadow-lg">
              🐠 NEW RECORD!
            </div>
          )}

          {score < highScore && (
            <p className="text-[10px] text-teal-200 mb-4 drop-shadow">
              Best: <span className="text-amber-300 font-bold">{highScore}</span>
            </p>
          )}

          <button
            onClick={startGame}
            className={`px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 border shadow-xl ${
              didWin 
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300/50 shadow-emerald-600/50' 
                : 'bg-teal-600 hover:bg-teal-500 border-teal-300/50 shadow-teal-600/50'
            }`}
          >
            🫧 {didWin ? 'PLAY AGAIN' : 'TRY AGAIN'}
          </button>
        </div>
      )}

      {/* Always visible restart button during gameplay */}
      {gameState === 'playing' && (
        <button
          onClick={startGame}
          className="absolute top-1.5 right-2 text-teal-200/70 hover:text-teal-50 transition-colors text-sm drop-shadow"
          title="Restart"
        >
          ↺
        </button>
      )}
    </div>
  );
};

