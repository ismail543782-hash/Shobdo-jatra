import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  Heart, Trophy, Play, Lock, RotateCcw, Zap, ArrowLeft,
  Wind, Puzzle, Swords, BookOpen, Star, Clock, ChevronRight, Gamepad2, MapPin,
} from 'lucide-react';

/* ---------------------------- design tokens ---------------------------- */
const C = {
  bgDark: '#0A2E33',
  panel: '#0E5561',
  panelLight: '#12707F',
  marigold: '#F2A93B',
  rose: '#E63973',
  green: '#4CAF7D',
  red: '#E85C4A',
  cream: '#FDF6E9',
};

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
  .font-display { font-family: 'Baloo Da 2', 'Hind Siliguri', sans-serif; }
  .font-body { font-family: 'Hind Siliguri', sans-serif; }
  @keyframes roadmove { 0% { background-position-x: 0; } 100% { background-position-x: -80px; } }
  @keyframes jumpUp { 0% { transform: translateY(0); } 40% { transform: translateY(-22px); } 100% { transform: translateY(0); } }
  @keyframes shakeX { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes fillBar { from { width: 0%; } }
  .jump-anim { animation: jumpUp 0.4s ease-out; }
  .shake-anim { animation: shakeX 0.35s ease-in-out; }
  .pop-anim { animation: popIn 0.25s ease-out; }
`;

/* ------------------------------- content -------------------------------- */
const WORDS = [
  { bn: 'ধন্যবাদ', en: 'Thank you', wrong: ['Sorry', 'Please'] },
  { bn: 'দয়া করে', en: 'Please', wrong: ['Welcome', 'Goodbye'] },
  { bn: 'কেমন আছেন?', en: 'How are you?', wrong: ['What is this?', 'Where are you?'] },
  { bn: 'ক্ষমা করবেন', en: 'Excuse me', wrong: ['Thank you', 'Good night'] },
  { bn: 'শুভ সকাল', en: 'Good morning', wrong: ['Good night', 'Good evening'] },
  { bn: 'শুভ রাত্রি', en: 'Good night', wrong: ['Good morning', 'Hello'] },
  { bn: 'আবার দেখা হবে', en: 'See you again', wrong: ['Nice to meet you', 'Take care'] },
  { bn: 'দুঃখিত', en: 'Sorry', wrong: ['Please', 'Welcome'] },
  { bn: 'স্বাগতম', en: 'Welcome', wrong: ['Thanks', 'Sorry'] },
  { bn: 'হ্যাঁ', en: 'Yes', wrong: ['No', 'Maybe'] },
  { bn: 'না', en: 'No', wrong: ['Yes', 'Please'] },
  { bn: 'পানি', en: 'Water', wrong: ['Food', 'Tea'] },
  { bn: 'খাবার', en: 'Food', wrong: ['Water', 'Milk'] },
  { bn: 'বন্ধু', en: 'Friend', wrong: ['Enemy', 'Teacher'] },
  { bn: 'পরিবার', en: 'Family', wrong: ['Friend', 'Neighbor'] },
  { bn: 'আজ', en: 'Today', wrong: ['Tomorrow', 'Yesterday'] },
  { bn: 'আগামীকাল', en: 'Tomorrow', wrong: ['Today', 'Yesterday'] },
  { bn: 'গতকাল', en: 'Yesterday', wrong: ['Today', 'Tomorrow'] },
  { bn: 'সাহায্য করুন', en: 'Help me', wrong: ['Thank you', 'Excuse me'] },
];

const SENTENCES = [
  { bn: 'আমার নাম রাহুল', tokens: ['My', 'name', 'is', 'Rahul'] },
  { bn: 'আপনি কেমন আছেন', tokens: ['How', 'are', 'you'] },
  { bn: 'আমি ভালো আছি', tokens: ['I', 'am', 'fine'] },
  { bn: 'এটার দাম কত', tokens: ['How', 'much', 'is', 'this'] },
  { bn: 'আমি বাংলাদেশ থেকে এসেছি', tokens: ['I', 'am', 'from', 'Bangladesh'] },
  { bn: 'আপনার সাথে দেখা হয়ে ভালো লাগলো', tokens: ['Nice', 'to', 'meet', 'you'] },
  { bn: 'আমি ইংরেজি শিখছি', tokens: ['I', 'am', 'learning', 'English'] },
  { bn: 'দয়া করে আবার বলুন', tokens: ['Please', 'say', 'it', 'again'] },
];

const STORIES = [
  {
    title: 'বাজারে একদিন',
    panels: [
      { bn: 'রাহুল বাজারে গিয়ে বলল', pre: '', post: ', how much is this?', options: ['Excuse me', 'Thank you', 'Good night'], correct: 'Excuse me' },
      { bn: 'দোকানদার উত্তর দিল', pre: 'This is fifty ', post: '.', options: ['taka', 'minutes', 'kilometers'], correct: 'taka' },
      { bn: 'রাহুল বলল', pre: "That's expensive, can you give a ", post: '?', options: ['discount', 'language', 'weather'], correct: 'discount' },
      { bn: 'দোকানদার হেসে বলল', pre: 'Okay, just for ', post: '!', options: ['you', 'rain', 'paper'], correct: 'you' },
    ],
  },
  {
    title: 'নতুন বন্ধু',
    panels: [
      { bn: 'দেখা হলে সে বলল', pre: 'Hello, ', post: ' to meet you.', options: ['nice', 'sad', 'cold'], correct: 'nice' },
      { bn: 'সে জিজ্ঞেস করল', pre: 'What is your ', post: '?', options: ['name', 'color', 'weather'], correct: 'name' },
      { bn: 'রাহুল উত্তর দিল', pre: 'I am from ', post: '.', options: ['Bangladesh', 'Tuesday', 'Table'], correct: 'Bangladesh' },
      { bn: 'দুজনে হেসে বলল', pre: "Let's be ", post: '!', options: ['friends', 'numbers', 'chairs'], correct: 'friends' },
    ],
  },
];

/* ------------------------------- helpers -------------------------------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick3(prevIdx) {
  let idx = Math.floor(Math.random() * WORDS.length);
  while (WORDS.length > 1 && idx === prevIdx) idx = Math.floor(Math.random() * WORDS.length);
  const w = WORDS[idx];
  const opts = shuffle([{ t: w.en, ok: true }, { t: w.wrong[0], ok: false }, { t: w.wrong[1], ok: false }]);
  return { idx, w, opts };
}
function pick4(prevIdx) {
  let idx = Math.floor(Math.random() * WORDS.length);
  while (WORDS.length > 1 && idx === prevIdx) idx = Math.floor(Math.random() * WORDS.length);
  const w = WORDS[idx];
  const usedTexts = new Set([w.en, w.wrong[0], w.wrong[1]]);
  let filler = 'Water';
  for (const cand of WORDS) {
    if (!usedTexts.has(cand.en)) { filler = cand.en; break; }
  }
  const opts = shuffle([{ t: w.en, ok: true }, { t: w.wrong[0], ok: false }, { t: w.wrong[1], ok: false }, { t: filler, ok: false }]);
  return { idx, w, opts };
}

/* ------------------------------- atoms ----------------------------------*/
function Hearts({ lives, max = 3 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} size={18} color={i < lives ? C.rose : '#1f5c65'} fill={i < lives ? C.rose : 'none'} />
      ))}
    </div>
  );
}

function TopBar({ title, onExit, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onExit} className="rounded-full p-2 active:scale-90 transition-transform" style={{ background: 'rgba(253,246,233,0.1)' }} aria-label="Back to hub">
        <ArrowLeft size={18} color={C.cream} />
      </button>
      <p className="font-display font-bold text-sm tracking-wide" style={{ color: C.cream }}>{title}</p>
      <div>{right}</div>
    </div>
  );
}

function ScallopEdge({ flip }) {
  return (
    <div style={{
      height: '10px',
      backgroundImage: `radial-gradient(circle at 8px ${flip ? '10px' : '0px'}, transparent 8px, ${C.marigold} 9px)`,
      backgroundSize: '16px 10px',
      backgroundColor: C.panel,
    }} />
  );
}

function Frame({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3" style={{ background: `linear-gradient(160deg, ${C.bgDark} 0%, ${C.panel} 60%, ${C.bgDark} 100%)` }}>
      <style>{FONT_CSS}</style>
      <div className="w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl relative" style={{ background: C.panel, border: `3px solid ${C.marigold}` }}>
        <ScallopEdge />
        <div className="px-4 py-5">{children}</div>
        <ScallopEdge flip />
      </div>
    </div>
  );
}

function ResultScreen({ ok, title, score, best, onRetry, onExit }) {
  return (
    <div className="flex flex-col items-center text-center py-6 pop-anim">
      <Trophy size={40} color={ok ? C.marigold : '#6b8b90'} />
      <h2 className="font-display text-xl font-extrabold mt-3" style={{ color: C.cream }}>{title}</h2>
      <p className="font-body text-xs mt-1" style={{ color: C.cream, opacity: 0.75 }}>স্কোর</p>
      <p className="font-display text-4xl font-extrabold" style={{ color: C.marigold }}>{score}</p>
      <p className="font-body text-xs mt-1" style={{ color: C.cream, opacity: 0.6 }}>সেরা স্কোর: {best}</p>
      <div className="flex gap-3 mt-6">
        <button onClick={onRetry} className="rounded-full px-5 py-3 flex items-center gap-2 font-display font-bold active:scale-95 transition-transform" style={{ background: C.marigold, color: C.bgDark }}>
          <RotateCcw size={16} /> আবার খেলুন
        </button>
        <button onClick={onExit} className="rounded-full px-5 py-3 font-display font-bold active:scale-95 transition-transform" style={{ background: 'rgba(253,246,233,0.12)', color: C.cream }}>
          হোমে ফিরুন
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Word Runner mode ---------------------------*/
const HIT_ZONE = 10;
const BASE_SPEED = 16;

function WordRunner({ onExit, onFinish, best }) {
  const [stage, setStage] = useState('intro');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(() => pick3(-1));
  const [groupX, setGroupX] = useState(100);
  const [feedback, setFeedback] = useState(null);
  const [jump, setJump] = useState(false);
  const [shake, setShake] = useState(false);

  const groupXRef = useRef(100);
  const answeredRef = useRef(false);
  const pausedRef = useRef(false);
  const speedRef = useRef(BASE_SPEED);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => { groupXRef.current = groupX; }, [groupX]);

  const nextRound = useCallback(() => {
    setFeedback(null);
    answeredRef.current = false;
    pausedRef.current = false;
    setRound((prev) => pick3(prev.idx));
    setGroupX(100);
    groupXRef.current = 100;
  }, []);

  const finish = useCallback((finalScore) => {
    setStage('result');
    onFinish(finalScore);
  }, [onFinish]);

  const handleMiss = useCallback(() => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    pausedRef.current = true;
    setStreak(0);
    setShake(true);
    setTimeout(() => setShake(false), 350);
    setFeedback({ chosen: -1, correctIdx: round.opts.findIndex((o) => o.ok) });
    setLives((l) => {
      const nl = l - 1;
      setTimeout(() => { nl <= 0 ? finish(score) : nextRound(); }, 700);
      return nl;
    });
  }, [round, score, finish, nextRound]);

  const handleAnswer = useCallback((idx) => {
    if (answeredRef.current || stage !== 'playing') return;
    answeredRef.current = true;
    pausedRef.current = true;
    const opt = round.opts[idx];
    const correctIdx = round.opts.findIndex((o) => o.ok);
    setFeedback({ chosen: idx, correctIdx });
    if (opt.ok) {
      setJump(true);
      setTimeout(() => setJump(false), 400);
      setScore((s) => {
        const ns = s + 10;
        setTimeout(() => nextRound(), 450);
        return ns;
      });
      setStreak((st) => {
        const ns = st + 1;
        if (ns > 0 && ns % 5 === 0) speedRef.current = Math.min(speedRef.current + 2, 34);
        return ns;
      });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setStreak(0);
      setLives((l) => {
        const nl = l - 1;
        setTimeout(() => { nl <= 0 ? finish(score) : nextRound(); }, 700);
        return nl;
      });
    }
  }, [round, stage, score, finish, nextRound]);

  useEffect(() => {
    if (stage !== 'playing') return;
    const loop = (ts) => {
      if (lastTimeRef.current == null) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;
      if (!pausedRef.current) {
        let nx = groupXRef.current - speedRef.current * dt;
        if (nx <= HIT_ZONE && !answeredRef.current) {
          nx = HIT_ZONE;
          groupXRef.current = nx;
          setGroupX(nx);
          handleMiss();
        } else {
          groupXRef.current = nx;
          setGroupX(nx);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); lastTimeRef.current = null; };
  }, [stage, handleMiss]);

  const start = () => {
    setLives(3); setScore(0); setStreak(0);
    speedRef.current = BASE_SPEED;
    setRound(pick3(-1)); setGroupX(100); groupXRef.current = 100;
    answeredRef.current = false; pausedRef.current = false;
    setFeedback(null); setStage('playing');
  };

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <TopBar title="Word Runner" onExit={onExit} />
        <div className="text-5xl mb-2">🛺</div>
        <p className="font-display text-lg font-bold" style={{ color: C.cream }}>রিকশা থামাও, শব্দ বাঁচাও!</p>
        <p className="font-body text-sm mt-2 max-w-xs" style={{ color: C.cream, opacity: 0.75 }}>
          হিট জোনে পৌঁছানোর আগে সঠিক ইংরেজি শব্দে ট্যাপ করুন। ৩টি জীবন আছে।
        </p>
        <p className="font-body text-xs mt-3" style={{ color: C.marigold }}>সেরা স্কোর: {best}</p>
        <button onClick={start} className="mt-6 rounded-full px-6 py-3 flex items-center gap-2 font-display font-bold active:scale-95 transition-transform" style={{ background: C.rose, color: C.cream }}>
          <Play size={18} fill={C.cream} /> শুরু করুন
        </button>
      </div>
    );
  }

  if (stage === 'result') {
    return <>
      <TopBar title="Word Runner" onExit={onExit} />
      <ResultScreen ok={score > 0} title="গেম শেষ!" score={score} best={Math.max(best, score)} onRetry={start} onExit={onExit} />
    </>;
  }

  return (
    <div className={shake ? 'shake-anim' : ''}>
      <TopBar title="Word Runner" onExit={onExit} right={<span className="font-display font-extrabold text-lg" style={{ color: C.cream }}>{score}</span>} />
      <div className="flex items-center justify-between mb-3">
        <Hearts lives={lives} />
        <div className="flex items-center gap-1 font-display font-bold text-sm" style={{ color: C.marigold }}>
          <Zap size={15} fill={C.marigold} /><span>{streak}</span>
        </div>
      </div>

      <div className="rounded-2xl py-3 px-4 text-center mb-4 shadow-inner" style={{ background: C.cream }}>
        <p className="font-body text-xs" style={{ color: C.panel }}>এই শব্দের ইংরেজি কী?</p>
        <p className="font-display text-2xl font-bold mt-1" style={{ color: C.bgDark }}>{round.w.bn}</p>
      </div>

      <div className="relative h-28 rounded-2xl overflow-hidden mb-3 shadow-lg" style={{
        backgroundColor: '#0F454E',
        backgroundImage: `repeating-linear-gradient(90deg, ${C.marigold} 0 20px, transparent 20px 40px)`,
        backgroundPosition: '0 50%', backgroundSize: '80px 4px', backgroundRepeat: 'repeat-x',
        animation: 'roadmove 1s linear infinite',
      }}>
        <div className="absolute top-0 bottom-0" style={{ left: `${HIT_ZONE}%`, width: '2px', background: 'rgba(230,57,115,0.6)' }} />
        <div className={`absolute bottom-2 text-3xl ${jump ? 'jump-anim' : ''}`} style={{ left: `${HIT_ZONE - 4}%` }}>🛺</div>
        <div className="absolute top-2 flex gap-2" style={{ left: `${groupX}%` }}>
          {round.opts.map((opt, i) => {
            let bg = C.panel;
            if (feedback) { if (i === feedback.correctIdx) bg = C.green; else if (i === feedback.chosen) bg = C.red; }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className="font-body text-sm font-semibold px-3 py-2 rounded-xl whitespace-nowrap active:scale-95 transition-transform shadow-md" style={{ background: bg, color: C.cream, border: `2px solid ${C.marigold}` }}>
                {opt.t}
              </button>
            );
          })}
        </div>
      </div>
      <p className="font-body text-xs text-center" style={{ color: C.cream, opacity: 0.55 }}>হিট জোন পার হওয়ার আগে সঠিক শব্দে ট্যাপ করুন</p>
    </div>
  );
}

/* ------------------------- Sentence Builder mode -------------------------*/
function buildBuilderRound(prevIdx) {
  let idx = Math.floor(Math.random() * SENTENCES.length);
  while (SENTENCES.length > 1 && idx === prevIdx) idx = Math.floor(Math.random() * SENTENCES.length);
  const s = SENTENCES[idx];
  const pool = shuffle(s.tokens.map((t, i) => ({ t, key: `${t}-${i}` })));
  return { idx, s, pool };
}

function SentenceBuilder({ onExit, onFinish, best }) {
  const [stage, setStage] = useState('intro');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(() => buildBuilderRound(-1));
  const [pool, setPool] = useState(round.pool);
  const [slots, setSlots] = useState([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [wrongKey, setWrongKey] = useState(null);
  const [locked, setLocked] = useState(false);

  const lockedRef = useRef(false);
  const intervalRef = useRef(null);

  const finish = useCallback((finalScore) => { setStage('result'); onFinish(finalScore); }, [onFinish]);

  const nextRound = useCallback(() => {
    const r = buildBuilderRound(round.idx);
    setRound(r); setPool(r.pool); setSlots([]); setTimeLeft(20); setWrongKey(null);
    lockedRef.current = false; setLocked(false);
  }, [round.idx]);

  useEffect(() => {
    if (stage !== 'playing') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          if (!lockedRef.current) {
            lockedRef.current = true; setLocked(true);
            setLives((l) => {
              const nl = l - 1;
              setTimeout(() => { nl <= 0 ? finish(score) : nextRound(); }, 900);
              return nl;
            });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [stage, round.idx, score, finish, nextRound]);

  const tapToken = (item) => {
    if (lockedRef.current) return;
    const nextExpected = round.s.tokens[slots.length];
    if (item.t === nextExpected) {
      const newSlots = [...slots, item.t];
      setSlots(newSlots);
      setPool((p) => p.filter((x) => x.key !== item.key));
      if (newSlots.length === round.s.tokens.length) {
        lockedRef.current = true; setLocked(true);
        clearInterval(intervalRef.current);
        const gained = 10 + timeLeft;
        setScore((s) => s + gained);
        setTimeout(() => nextRound(), 600);
      }
    } else {
      setWrongKey(item.key);
      setTimeout(() => setWrongKey(null), 350);
    }
  };

  const start = () => {
    setLives(3); setScore(0);
    const r = buildBuilderRound(-1);
    setRound(r); setPool(r.pool); setSlots([]); setTimeLeft(20);
    lockedRef.current = false; setLocked(false); setStage('playing');
  };

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <TopBar title="Sentence Builder" onExit={onExit} />
        <div className="text-5xl mb-2">🧩</div>
        <p className="font-display text-lg font-bold" style={{ color: C.cream }}>সঠিক ক্রমে বাক্য সাজান</p>
        <p className="font-body text-sm mt-2 max-w-xs" style={{ color: C.cream, opacity: 0.75 }}>
          বাংলা বাক্যের ইংরেজি অনুবাদ, শব্দ ধাপে ধাপে সঠিক ক্রমে ট্যাপ করে সাজান। সময় শেষ হওয়ার আগে!
        </p>
        <p className="font-body text-xs mt-3" style={{ color: C.marigold }}>সেরা স্কোর: {best}</p>
        <button onClick={start} className="mt-6 rounded-full px-6 py-3 flex items-center gap-2 font-display font-bold active:scale-95 transition-transform" style={{ background: C.rose, color: C.cream }}>
          <Play size={18} fill={C.cream} /> শুরু করুন
        </button>
      </div>
    );
  }
  if (stage === 'result') {
    return <>
      <TopBar title="Sentence Builder" onExit={onExit} />
      <ResultScreen ok={score > 0} title="গেম শেষ!" score={score} best={Math.max(best, score)} onRetry={start} onExit={onExit} />
    </>;
  }

  const pct = (timeLeft / 20) * 100;

  return (
    <div>
      <TopBar title="Sentence Builder" onExit={onExit} right={<span className="font-display font-extrabold text-lg" style={{ color: C.cream }}>{score}</span>} />
      <div className="flex items-center justify-between mb-3">
        <Hearts lives={lives} />
        <div className="flex items-center gap-1 font-body text-xs" style={{ color: C.cream, opacity: 0.8 }}>
          <Clock size={14} /><span>{timeLeft}s</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(253,246,233,0.15)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct < 30 ? C.red : C.marigold }} />
      </div>

      <div className="rounded-2xl py-3 px-4 text-center mb-4 shadow-inner" style={{ background: C.cream }}>
        <p className="font-body text-xs" style={{ color: C.panel }}>বাক্যটি ইংরেজিতে সাজান</p>
        <p className="font-display text-xl font-bold mt-1" style={{ color: C.bgDark }}>{round.s.bn}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-5 min-h-[46px]">
        {round.s.tokens.map((t, i) => (
          <div key={i} className="rounded-xl px-4 py-2 font-body font-semibold text-sm shadow-md" style={{
            background: slots[i] ? (locked && !slots[i] ? C.red : C.green) : 'rgba(253,246,233,0.12)',
            color: slots[i] ? C.cream : 'transparent',
            border: `2px dashed ${slots[i] ? 'transparent' : 'rgba(253,246,233,0.3)'}`,
            minWidth: '48px', textAlign: 'center',
          }}>
            {slots[i] || '·'}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {pool.map((item) => (
          <button key={item.key} onClick={() => tapToken(item)} className={`rounded-xl px-4 py-2 font-body font-semibold text-sm shadow-md active:scale-95 transition-transform ${wrongKey === item.key ? 'shake-anim' : ''}`} style={{ background: wrongKey === item.key ? C.red : C.panelLight, color: C.cream, border: `2px solid ${C.marigold}` }}>
            {item.t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- Vocabulary Battle mode -------------------------*/
const OPP_MAX_HP = 5;

function VocabBattle({ onExit, onFinish, best }) {
  const [stage, setStage] = useState('intro');
  const [lives, setLives] = useState(3);
  const [oppHP, setOppHP] = useState(OPP_MAX_HP);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pick4(-1));
  const [timeLeft, setTimeLeft] = useState(6);
  const [feedback, setFeedback] = useState(null);
  const [oppHit, setOppHit] = useState(false);
  const [shake, setShake] = useState(false);

  const lockedRef = useRef(false);
  const intervalRef = useRef(null);

  const finish = useCallback((finalScore) => { setStage('result'); onFinish(finalScore); }, [onFinish]);

  const nextQ = useCallback(() => {
    setQ((prev) => pick4(prev.idx));
    setTimeLeft(6); setFeedback(null); lockedRef.current = false;
  }, []);

  const resolveWrong = useCallback((currentScore) => {
    setShake(true); setTimeout(() => setShake(false), 350);
    setLives((l) => {
      const nl = l - 1;
      setTimeout(() => { nl <= 0 ? finish(currentScore) : nextQ(); }, 700);
      return nl;
    });
  }, [finish, nextQ]);

  useEffect(() => {
    if (stage !== 'playing') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          if (!lockedRef.current) {
            lockedRef.current = true;
            setFeedback({ chosen: -1, correctIdx: q.opts.findIndex((o) => o.ok) });
            setScore((s) => { resolveWrong(s); return s; });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [stage, q, resolveWrong]);

  const handleAnswer = (idx) => {
    if (lockedRef.current || stage !== 'playing') return;
    lockedRef.current = true;
    clearInterval(intervalRef.current);
    const opt = q.opts[idx];
    const correctIdx = q.opts.findIndex((o) => o.ok);
    setFeedback({ chosen: idx, correctIdx });
    if (opt.ok) {
      setOppHit(true); setTimeout(() => setOppHit(false), 300);
      setScore((s) => s + 15 + timeLeft);
      setOppHP((hp) => {
        const nhp = hp - 1;
        setTimeout(() => {
          if (nhp <= 0) setScore((s2) => { finish(s2); return s2; });
          else nextQ();
        }, 500);
        return nhp;
      });
    } else {
      setScore((s) => { resolveWrong(s); return s; });
    }
  };

  const start = () => {
    setLives(3); setOppHP(OPP_MAX_HP); setScore(0);
    setQ(pick4(-1)); setTimeLeft(6); setFeedback(null);
    lockedRef.current = false; setStage('playing');
  };

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <TopBar title="Vocabulary Battle" onExit={onExit} />
        <div className="text-5xl mb-2">⚔️</div>
        <p className="font-display text-lg font-bold" style={{ color: C.cream }}>দ্রুত উত্তর দিয়ে জয় করুন</p>
        <p className="font-body text-sm mt-2 max-w-xs" style={{ color: C.cream, opacity: 0.75 }}>
          প্রতিপক্ষকে হারাতে ৫টি সঠিক উত্তর দিন। প্রতিটি প্রশ্নের জন্য মাত্র ৬ সেকেন্ড!
        </p>
        <p className="font-body text-xs mt-3" style={{ color: C.marigold }}>সেরা স্কোর: {best}</p>
        <button onClick={start} className="mt-6 rounded-full px-6 py-3 flex items-center gap-2 font-display font-bold active:scale-95 transition-transform" style={{ background: C.rose, color: C.cream }}>
          <Play size={18} fill={C.cream} /> শুরু করুন
        </button>
      </div>
    );
  }
  if (stage === 'result') {
    return <>
      <TopBar title="Vocabulary Battle" onExit={onExit} />
      <ResultScreen ok={score > 0} title={oppHP <= 0 ? 'বিজয়!' : 'গেম শেষ!'} score={score} best={Math.max(best, score)} onRetry={start} onExit={onExit} />
    </>;
  }

  const timePct = (timeLeft / 6) * 100;
  const oppPct = (oppHP / OPP_MAX_HP) * 100;

  return (
    <div className={shake ? 'shake-anim' : ''}>
      <TopBar title="Vocabulary Battle" onExit={onExit} right={<span className="font-display font-extrabold text-lg" style={{ color: C.cream }}>{score}</span>} />
      <div className="flex items-center justify-between mb-2">
        <Hearts lives={lives} />
        <div className={`text-2xl ${oppHit ? 'shake-anim' : ''}`}>👹</div>
      </div>
      <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(253,246,233,0.15)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${oppPct}%`, background: C.red }} />
      </div>
      <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(253,246,233,0.15)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${timePct}%`, background: timePct < 30 ? C.red : C.marigold }} />
      </div>

      <div className="rounded-2xl py-3 px-4 text-center mb-4 shadow-inner" style={{ background: C.cream }}>
        <p className="font-body text-xs" style={{ color: C.panel }}>এই শব্দের ইংরেজি কী?</p>
        <p className="font-display text-2xl font-bold mt-1" style={{ color: C.bgDark }}>{q.w.bn}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {q.opts.map((opt, i) => {
          let bg = C.panelLight;
          if (feedback) { if (i === feedback.correctIdx) bg = C.green; else if (i === feedback.chosen) bg = C.red; }
          return (
            <button key={i} onClick={() => handleAnswer(i)} className="font-body font-semibold text-sm px-3 py-3 rounded-xl active:scale-95 transition-transform shadow-md" style={{ background: bg, color: C.cream, border: `2px solid ${C.marigold}` }}>
              {opt.t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- Story Match mode ----------------------------*/
function StoryMatch({ onExit, onFinish, best }) {
  const [stage, setStage] = useState('intro');
  const [storyIdx, setStoryIdx] = useState(0);
  const [panelIdx, setPanelIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);

  const story = STORIES[storyIdx];
  const panel = story.panels[panelIdx];

  const finish = useCallback((finalScore) => { setStage('result'); onFinish(finalScore); }, [onFinish]);

  const start = () => {
    setStoryIdx(Math.floor(Math.random() * STORIES.length));
    setPanelIdx(0); setLives(3); setScore(0); setFeedback(null); setLocked(false);
    setStage('playing');
  };

  const choose = (opt) => {
    if (locked) return;
    setLocked(true);
    const ok = opt === panel.correct;
    setFeedback({ chosen: opt, ok });
    if (ok) setScore((s) => s + 12);
    setTimeout(() => {
      if (!ok) {
        setLives((l) => {
          const nl = l - 1;
          if (nl <= 0) { finish(score + (ok ? 12 : 0)); return nl; }
          return nl;
        });
      }
      if (ok || lives - (ok ? 0 : 1) > 0) {
        if (panelIdx + 1 >= story.panels.length) {
          finish(score + (ok ? 12 : 0));
        } else {
          setPanelIdx((p) => p + 1);
          setFeedback(null);
          setLocked(false);
        }
      }
    }, 900);
  };

  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <TopBar title="Story Match" onExit={onExit} />
        <div className="text-5xl mb-2">📖</div>
        <p className="font-display text-lg font-bold" style={{ color: C.cream }}>গল্পে ইংরেজি শিখুন</p>
        <p className="font-body text-sm mt-2 max-w-xs" style={{ color: C.cream, opacity: 0.75 }}>
          প্রতিটি প্যানেলে ফাঁকা জায়গায় সঠিক শব্দ বেছে গল্প এগিয়ে নিন।
        </p>
        <p className="font-body text-xs mt-3" style={{ color: C.marigold }}>সেরা স্কোর: {best}</p>
        <button onClick={start} className="mt-6 rounded-full px-6 py-3 flex items-center gap-2 font-display font-bold active:scale-95 transition-transform" style={{ background: C.rose, color: C.cream }}>
          <Play size={18} fill={C.cream} /> শুরু করুন
        </button>
      </div>
    );
  }
  if (stage === 'result') {
    return <>
      <TopBar title="Story Match" onExit={onExit} />
      <ResultScreen ok={score > 0} title="গল্প শেষ!" score={score} best={Math.max(best, score)} onRetry={start} onExit={onExit} />
    </>;
  }

  return (
    <div>
      <TopBar title={story.title} onExit={onExit} right={<span className="font-display font-extrabold text-lg" style={{ color: C.cream }}>{score}</span>} />
      <div className="flex items-center justify-between mb-3">
        <Hearts lives={lives} />
        <div className="flex gap-1">
          {story.panels.map((_, i) => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i <= panelIdx ? C.marigold : 'rgba(253,246,233,0.2)' }} />
          ))}
        </div>
      </div>

      <p className="font-body text-xs mb-2 text-center" style={{ color: C.cream, opacity: 0.7 }}>{panel.bn}</p>

      <div className="rounded-2xl py-4 px-4 text-center mb-5 shadow-inner" style={{ background: C.cream }}>
        <p className="font-display text-lg font-semibold" style={{ color: C.bgDark }}>
          {panel.pre}
          <span className="inline-block px-2 mx-1 rounded" style={{
            background: feedback ? (feedback.ok ? '#c9ecd8' : '#f9d3ca') : '#e7e0cf',
            borderBottom: `2px solid ${C.rose}`,
          }}>
            {feedback ? feedback.chosen : '_____'}
          </span>
          {panel.post}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {panel.options.map((opt) => {
          let bg = C.panelLight;
          if (feedback) {
            if (opt === panel.correct) bg = C.green;
            else if (opt === feedback.chosen) bg = C.red;
          }
          return (
            <button key={opt} onClick={() => choose(opt)} className="font-body font-semibold text-sm px-4 py-3 rounded-xl active:scale-95 transition-transform shadow-md text-left" style={{ background: bg, color: C.cream, border: `2px solid ${C.marigold}` }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Hub ----------------------------------*/
const GREETINGS = [
  'আজ কী শিখবেন?',
  'চলুন, আরেকটু এগিয়ে যাই',
  'অনুশীলন চালিয়ে যান',
  'আজকের যাত্রা শুরু হোক',
];

function Hub({ profile, onOpen }) {
  const level = Math.floor((profile.xp || 0) / 100) + 1;
  const xpIntoLevel = (profile.xp || 0) % 100;
  const totalPlays = profile.totalPlays || 0;
  const greeting = GREETINGS[level % GREETINGS.length];

  const modes = [
    { key: 'runner', name: 'Word Runner', bn: 'শব্দ দৌড়', tag: 'রিফ্লেক্স', icon: Wind, color: C.rose, emoji: '🛺' },
    { key: 'builder', name: 'Sentence Builder', bn: 'বাক্য গঠন', tag: 'পাজল', icon: Puzzle, color: C.marigold, emoji: '🧩' },
    { key: 'battle', name: 'Vocabulary Battle', bn: 'শব্দ যুদ্ধ', tag: 'কুইজ', icon: Swords, color: C.red, emoji: '⚔️' },
    { key: 'story', name: 'Story Match', bn: 'গল্প মিলান', tag: 'গল্প', icon: BookOpen, color: C.green, emoji: '📖' },
  ];

  return (
    <div>
      {/* hero */}
      <div className="relative rounded-2xl mb-5 px-4 pt-5 pb-4 overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.rose} 0%, ${C.panelLight} 100%)` }}>
        <div className="absolute -right-3 -bottom-3 text-7xl opacity-20 select-none">🛺</div>
        <p className="font-body text-xs relative" style={{ color: C.cream, opacity: 0.85 }}>{greeting}</p>
        <h1 className="font-display text-3xl font-extrabold relative mt-0.5" style={{ color: C.cream }}>শব্দযাত্রা</h1>
        <p className="font-body text-xs relative mt-0.5" style={{ color: C.cream, opacity: 0.8 }}>খেলতে খেলতে ইংরেজি শিখুন</p>

        <div className="relative flex items-center justify-between mt-4 mb-1">
          <span className="font-display text-xs font-bold flex items-center gap-1" style={{ color: C.cream }}>
            <Star size={13} fill={C.marigold} color={C.marigold} /> লেভেল {level}
          </span>
          <span className="font-body text-[11px]" style={{ color: C.cream, opacity: 0.75 }}>{xpIntoLevel}/100 XP</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(253,246,233,0.25)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${xpIntoLevel}%`, background: C.marigold }} />
        </div>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: 'rgba(253,246,233,0.08)' }}>
          <div className="rounded-full p-1.5" style={{ background: 'rgba(242,169,59,0.2)' }}>
            <Trophy size={15} color={C.marigold} />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none" style={{ color: C.cream }}>{profile.xp || 0}</p>
            <p className="font-body text-[10px]" style={{ color: C.cream, opacity: 0.6 }}>মোট XP</p>
          </div>
        </div>
        <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2.5" style={{ background: 'rgba(253,246,233,0.08)' }}>
          <div className="rounded-full p-1.5" style={{ background: 'rgba(76,175,125,0.2)' }}>
            <Gamepad2 size={15} color={C.green} />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none" style={{ color: C.cream }}>{totalPlays}</p>
            <p className="font-body text-[10px]" style={{ color: C.cream, opacity: 0.6 }}>মোট রাউন্ড</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <p className="font-body text-xs" style={{ color: C.cream, opacity: 0.6 }}>টপিক: দৈনন্দিন কথোপকথন</p>
        <p className="font-body text-[10px]" style={{ color: C.cream, opacity: 0.45 }}>৪টি মোড</p>
      </div>

      {/* mode list */}
      <div className="flex flex-col gap-2.5">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => onOpen(m.key)}
              className="relative rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform shadow-lg overflow-hidden"
              style={{ background: C.panelLight }}
            >
              <div className="absolute -right-2 -bottom-2 text-4xl opacity-[0.12] select-none">{m.emoji}</div>
              <div className="rounded-xl p-2.5 relative" style={{ background: `${m.color}2a` }}>
                <Icon size={20} color={m.color} />
              </div>
              <div className="flex-1 relative min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-display font-bold text-sm" style={{ color: C.cream }}>{m.bn}</p>
                  <span className="font-body text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${m.color}30`, color: m.color }}>{m.tag}</span>
                </div>
                <p className="font-body text-[10px] mt-0.5" style={{ color: C.cream, opacity: 0.6 }}>{m.name} · সেরা {profile.best?.[m.key] || 0}</p>
              </div>
              <ChevronRight size={18} color={C.cream} style={{ opacity: 0.5 }} className="relative" />
            </button>
          );
        })}
      </div>

      {/* upcoming topics roadmap */}
      <div className="mt-5 rounded-2xl p-3" style={{ background: 'rgba(11,46,51,0.5)' }}>
        <p className="font-body text-[10px] mb-2" style={{ color: C.cream, opacity: 0.55 }}>পরবর্তী টপিক</p>
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ভ্রমণ', 'খাবার', 'অফিস ইংরেজি'].map((t, i) => (
            <div key={t} className="flex items-center gap-1.5 shrink-0">
              <div className="rounded-full p-1.5 opacity-40" style={{ background: 'rgba(253,246,233,0.1)' }}>
                <MapPin size={12} color={C.cream} />
              </div>
              <span className="font-body text-[11px] opacity-45" style={{ color: C.cream }}>{t}</span>
              {i < 2 && <div className="w-4 h-px opacity-25" style={{ background: C.cream }} />}
            </div>
          ))}
          <Lock size={12} color={C.cream} style={{ opacity: 0.4 }} className="shrink-0 ml-1" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- App -----------------------------------*/
export default function App() {
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('hub');

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get('shobdojatra_profile');
        setProfile(res ? JSON.parse(res.value) : { xp: 0, best: {}, totalPlays: 0 });
      } catch (e) {
        setProfile({ xp: 0, best: {}, totalPlays: 0 });
      }
    })();
  }, []);

  const reportResult = useCallback((mode, score) => {
    setProfile((prev) => {
      const next = {
        xp: (prev.xp || 0) + Math.max(score, 0),
        best: { ...(prev.best || {}), [mode]: Math.max(prev.best?.[mode] || 0, score) },
        totalPlays: (prev.totalPlays || 0) + 1,
      };
      (async () => {
        try { await window.storage.set('shobdojatra_profile', JSON.stringify(next)); } catch (e) { /* ignore */ }
      })();
      return next;
    });
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: C.bgDark }}>
        <style>{FONT_CSS}</style>
        <p className="font-display text-lg font-bold" style={{ color: C.marigold }}>লোড হচ্ছে…</p>
      </div>
    );
  }

  const modeProps = (key) => ({
    onExit: () => setScreen('hub'),
    onFinish: (score) => reportResult(key, score),
    best: profile.best?.[key] || 0,
  });

  return (
    <Frame>
      {screen === 'hub' && <Hub profile={profile} onOpen={setScreen} />}
      {screen === 'runner' && <WordRunner {...modeProps('runner')} />}
      {screen === 'builder' && <SentenceBuilder {...modeProps('builder')} />}
      {screen === 'battle' && <VocabBattle {...modeProps('battle')} />}
      {screen === 'story' && <StoryMatch {...modeProps('story')} />}
      <Analytics />
    </Frame>
  );
}
