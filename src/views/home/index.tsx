// Next, React
import { FC, useState, useEffect, useCallback } from 'react';
import pkg from '../../../package.json';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Casino
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
          {/* Fake “feed card” top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start px-3 pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-white/10 px-2 text-[9px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
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
  color: string;
}

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

  // Calculate difficulty based on score
  const difficulty = Math.min(Math.floor(score / 10), 15);
  const baseFallSpeed = Math.max(0.8, 2.5 - difficulty * 0.1);
  const spawnRate = Math.max(700, 1800 - difficulty * 70);

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

  // Spawn new letters
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnLetter = () => {
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O to avoid confusion
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const x = 10 + Math.random() * 80;

      // Determine letter type
      let type: 'normal' | 'golden' | 'bomb' = 'normal';
      const rand = Math.random();
      if (score > 5 && rand > 0.97) type = 'bomb';
      else if (rand > 0.88) type = 'golden';

      const speedMultiplier = powerUp === 'slow' ? 0.4 : 1;

      setFallingLetters((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          letter: randomLetter,
          x,
          y: -5,
          speed: baseFallSpeed * speedMultiplier * (0.8 + Math.random() * 0.4),
          type,
        },
      ]);
    };

    const interval = setInterval(spawnLetter, spawnRate);
    return () => clearInterval(interval);
  }, [gameState, spawnRate, baseFallSpeed, powerUp, score]);

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

  // Keyboard input handler
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const typed = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(typed)) return;

      setFallingLetters((prev) => {
        const matchingLetters = prev.filter((l) => l.letter === typed);

        if (matchingLetters.length === 0) {
          setLastTyped({ letter: typed, correct: false });
          setCombo(0);
          setTimeout(() => setLastTyped(null), 250);
          return prev;
        }

        // Get the lowest matching letter (closest to danger zone)
        const target = matchingLetters.reduce((a, b) => (a.y > b.y ? a : b));

        // Handle bomb - instant game over!
        if (target.type === 'bomb') {
          setScreenShake(true);
          setTimeout(() => {
            setLives(0);
            setGameState('gameover');
            setScreenShake(false);
          }, 200);
          return prev;
        }

        // Award points with combo multiplier
        const basePoints = target.type === 'golden' ? 3 : 1;
        const comboMultiplier = Math.min(5, Math.floor(combo / 3) + 1);
        setScore((s) => s + basePoints * comboMultiplier);
        setCombo((c) => c + 1);

        // Create explosion particles
        const particleColors =
          target.type === 'golden'
            ? ['#fbbf24', '#f59e0b', '#fcd34d']
            : ['#38bdf8', '#0ea5e9', '#7dd3fc'];

        const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
          id: `${Date.now()}-p${i}`,
          x: target.x + (Math.random() - 0.5) * 10,
          y: target.y + (Math.random() - 0.5) * 10,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        }));

        setParticles((p) => [...p, ...newParticles]);
        setTimeout(() => {
          setParticles((p) => p.filter((particle) => !newParticles.find((np) => np.id === particle.id)));
        }, 400);

        setLastTyped({ letter: typed, correct: true });
        setTimeout(() => setLastTyped(null), 200);

        return prev.filter((l) => l.id !== target.id);
      });
    },
    [gameState, combo]
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

  // Clear particles periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles((p) => p.slice(-20));
    }, 2000);
    return () => clearInterval(cleanup);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(5);
    setCombo(0);
    setFallingLetters([]);
    setParticles([]);
    setPowerUp('none');
    setLastTyped(null);
  };

  const getLetterStyle = (type: 'normal' | 'golden' | 'bomb') => {
    switch (type) {
      case 'golden':
        return {
          className: 'text-yellow-300',
          shadow: '0 0 12px #fbbf24, 0 0 24px #f59e0b',
        };
      case 'bomb':
        return {
          className: 'text-red-400',
          shadow: '0 0 12px #ef4444, 0 0 20px #dc2626',
        };
      default:
        return {
          className: 'text-cyan-300',
          shadow: '0 0 8px #38bdf8',
        };
    }
  };

  const comboMultiplier = Math.min(5, Math.floor(combo / 3) + 1);

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
        screenShake ? 'animate-pulse' : ''
      }`}
      style={{
        transform: screenShake ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : 'none',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 50%, rgba(15,23,42,0.95) 100%)',
      }}
    >
      {/* HUD - Score, Combo, Lives */}
      <div className="flex justify-between items-start px-2 pt-1 pb-0.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold text-cyan-300"
              style={{ textShadow: '0 0 10px #38bdf8' }}
            >
              {score}
            </span>
            {combo >= 3 && (
              <span
                className="text-[10px] font-bold text-yellow-400 animate-pulse px-1 py-0.5 rounded bg-yellow-400/10"
              >
                {comboMultiplier}x
              </span>
            )}
          </div>
          <span className="text-[8px] text-slate-500">Best: {highScore}</span>
        </div>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-xs transition-all duration-200 ${
                i < lives ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
              }`}
              style={{ filter: i < lives ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Power-up indicator */}
      {powerUp !== 'none' && (
        <div
          className="absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-medium animate-pulse z-20"
          style={{
            background: powerUp === 'slow' ? 'rgba(168,85,247,0.2)' : 'rgba(34,197,94,0.2)',
            color: powerUp === 'slow' ? '#c084fc' : '#4ade80',
            border: `1px solid ${powerUp === 'slow' ? 'rgba(168,85,247,0.3)' : 'rgba(34,197,94,0.3)'}`,
          }}
        >
          {powerUp === 'slow' ? '🐌 SLOW TIME' : '🛡️ SHIELD'}
        </div>
      )}

      {/* Difficulty indicator */}
      {gameState === 'playing' && difficulty > 0 && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] text-slate-600">
          Lv.{difficulty + 1}
        </div>
      )}

      {/* Game Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Starfield background effect */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}

        {/* Falling letters */}
        {fallingLetters.map((letter) => {
          const style = getLetterStyle(letter.type);
          return (
            <div
              key={letter.id}
              className={`absolute text-xl font-bold transition-none ${style.className} ${
                letter.type === 'golden' ? 'animate-pulse' : ''
              } ${letter.type === 'bomb' ? 'animate-bounce' : ''}`}
              style={{
                left: `${letter.x}%`,
                top: `${letter.y}%`,
                transform: 'translate(-50%, -50%)',
                textShadow: style.shadow,
                fontFamily: 'monospace',
              }}
            >
              {letter.type === 'bomb' ? '💣' : letter.letter}
            </div>
          );
        })}

        {/* Danger zone gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(239,68,68,0.15) 0%, transparent 100%)',
          }}
        />

        {/* Danger zone line */}
        <div
          className="absolute bottom-[5%] left-[5%] right-[5%] h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)',
          }}
        />
      </div>

      {/* Input feedback */}
      {lastTyped && (
        <div
          className={`absolute bottom-16 left-1/2 -translate-x-1/2 text-3xl font-black transition-all duration-100 z-30 ${
            lastTyped.correct ? 'scale-125' : 'scale-90'
          }`}
          style={{
            color: lastTyped.correct ? '#4ade80' : '#f87171',
            textShadow: lastTyped.correct ? '0 0 20px #4ade80' : '0 0 15px #ef4444',
            fontFamily: 'monospace',
          }}
        >
          {lastTyped.letter}
        </div>
      )}

      {/* Keyboard hint */}
      {gameState === 'playing' && (
        <div className="text-center text-[9px] text-slate-500 py-1 bg-slate-900/50">
          ⌨️ Type the letters!
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm z-50">
          <div
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-1"
            style={{ textShadow: '0 0 40px rgba(56,189,248,0.5)' }}
          >
            LETTER RAIN
          </div>
          <p className="text-[10px] text-cyan-300/80 mb-3">Type falling letters to survive!</p>

          <div className="text-[9px] text-slate-400 mb-4 space-y-1.5 text-center px-6">
            <div className="flex items-center justify-center gap-2">
              <span className="text-cyan-400" style={{ textShadow: '0 0 8px #38bdf8' }}>A</span>
              <span className="text-slate-500">Normal = 1pt</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-yellow-400 animate-pulse" style={{ textShadow: '0 0 8px #fbbf24' }}>G</span>
              <span className="text-slate-500">Golden = 3pts</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>💣</span>
              <span className="text-red-400">Bomb = Game Over!</span>
            </div>
          </div>

          <div className="text-[8px] text-slate-500 mb-4 text-center">
            🎯 Build combos for multipliers!<br/>
            ⚡ Speed increases as you score
          </div>

          <button
            onClick={startGame}
            className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            style={{
              boxShadow: '0 0 30px rgba(56,189,248,0.4), 0 0 60px rgba(139,92,246,0.2)',
            }}
          >
            START GAME
          </button>

          {highScore > 0 && (
            <p className="text-[9px] text-slate-500 mt-3">
              🏆 High Score: <span className="text-yellow-400">{highScore}</span>
            </p>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-50">
          <div
            className="text-xl font-black text-red-400 mb-2"
            style={{ textShadow: '0 0 20px rgba(239,68,68,0.6)' }}
          >
            GAME OVER
          </div>

          <div className="text-4xl font-black text-white mb-1" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
            {score}
          </div>
          <p className="text-[10px] text-slate-400 mb-2">POINTS</p>

          {score >= highScore && score > 0 && (
            <div
              className="text-xs font-bold text-yellow-400 mb-3 px-3 py-1 rounded-full animate-pulse"
              style={{
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            >
              🎉 NEW HIGH SCORE!
            </div>
          )}

          {score < highScore && (
            <p className="text-[9px] text-slate-500 mb-3">
              Best: <span className="text-yellow-400">{highScore}</span>
            </p>
          )}

          {/* Stats */}
          <div className="text-[9px] text-slate-500 mb-4 text-center">
            Level reached: {difficulty + 1}
          </div>

          <button
            onClick={startGame}
            className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            style={{
              boxShadow: '0 0 30px rgba(56,189,248,0.4), 0 0 60px rgba(139,92,246,0.2)',
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Always visible restart button during gameplay */}
      {gameState === 'playing' && (
        <button
          onClick={startGame}
          className="absolute top-0.5 right-1 text-slate-500 hover:text-white transition-colors text-sm opacity-50 hover:opacity-100"
          title="Restart"
        >
          ↺
        </button>
      )}
    </div>
  );
};

