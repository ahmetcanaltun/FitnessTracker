import { useState, useEffect, useRef } from "react";
import {
  Dumbbell, Search, ChevronLeft, Plus, Minus, TrendingUp, TrendingDown,
  User, Activity, X, Trophy, Flame, Check, Utensils, Droplet,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const MUSCLES = ["Tümü", "Göğüs", "Sırt", "Bacak", "Omuz"];

const INITIAL_EXERCISES = [
  {
    id: "bench", name: "Bench Press", muscle: "Göğüs", equipment: "Barbell",
    pr: 100, lastDate: "3 gün önce",
    history: [
      { d: "Şub", kg: 82.5, reps: 5, sets: 3 },
      { d: "Mar", kg: 87.5, reps: 5, sets: 3 },
      { d: "Nis", kg: 90, reps: 4, sets: 3 },
      { d: "May", kg: 92.5, reps: 4, sets: 3 },
      { d: "Haz", kg: 97.5, reps: 3, sets: 3 },
      { d: "Tem", kg: 100, reps: 3, sets: 3 },
    ],
  },
  {
    id: "squat", name: "Squat", muscle: "Bacak", equipment: "Barbell",
    pr: 140, lastDate: "Bugün",
    history: [
      { d: "Şub", kg: 110, reps: 5, sets: 4 },
      { d: "Mar", kg: 117.5, reps: 5, sets: 4 },
      { d: "Nis", kg: 122.5, reps: 4, sets: 4 },
      { d: "May", kg: 130, reps: 4, sets: 3 },
      { d: "Haz", kg: 135, reps: 3, sets: 3 },
      { d: "Tem", kg: 140, reps: 2, sets: 3 },
    ],
  },
  {
    id: "deadlift", name: "Deadlift", muscle: "Sırt", equipment: "Barbell",
    pr: 160, lastDate: "5 gün önce",
    history: [
      { d: "Şub", kg: 140, reps: 5, sets: 3 },
      { d: "Mar", kg: 145, reps: 4, sets: 3 },
      { d: "Nis", kg: 150, reps: 3, sets: 3 },
      { d: "May", kg: 155, reps: 3, sets: 3 },
      { d: "Haz", kg: 160, reps: 2, sets: 3 },
      { d: "Tem", kg: 160, reps: 2, sets: 2 },
    ],
  },
  {
    id: "ohp", name: "Overhead Press", muscle: "Omuz", equipment: "Barbell",
    pr: 60, lastDate: "2 gün önce",
    history: [
      { d: "Şub", kg: 47.5, reps: 6, sets: 3 },
      { d: "Mar", kg: 50, reps: 5, sets: 3 },
      { d: "Nis", kg: 52.5, reps: 5, sets: 3 },
      { d: "May", kg: 55, reps: 4, sets: 3 },
      { d: "Haz", kg: 57.5, reps: 4, sets: 3 },
      { d: "Tem", kg: 60, reps: 3, sets: 3 },
    ],
  },
  {
    id: "row", name: "Barbell Row", muscle: "Sırt", equipment: "Barbell",
    pr: 80, lastDate: "1 hafta önce",
    history: [
      { d: "Şub", kg: 65, reps: 6, sets: 3 },
      { d: "Mar", kg: 70, reps: 6, sets: 3 },
      { d: "Nis", kg: 72.5, reps: 5, sets: 3 },
      { d: "May", kg: 77.5, reps: 5, sets: 3 },
      { d: "Haz", kg: 80, reps: 4, sets: 3 },
      { d: "Tem", kg: 77.5, reps: 5, sets: 3 },
    ],
  },
  {
    id: "pullup", name: "Ağırlıklı Pull-up", muscle: "Sırt", equipment: "Vücut Ağırlığı",
    pr: 22.5, lastDate: "4 gün önce",
    history: [
      { d: "Şub", kg: 5, reps: 6, sets: 3 },
      { d: "Mar", kg: 10, reps: 5, sets: 3 },
      { d: "Nis", kg: 12.5, reps: 5, sets: 3 },
      { d: "May", kg: 17.5, reps: 4, sets: 3 },
      { d: "Haz", kg: 20, reps: 4, sets: 3 },
      { d: "Tem", kg: 22.5, reps: 3, sets: 3 },
    ],
  },
];

const MEALS = ["Kahvaltı", "Öğle Yemeği", "Akşam Yemeği", "Atıştırmalık"];

const FOOD_DB = [
  { id: "oats", name: "Yulaf Ezmesi", unit: "100g", kcalPer: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { id: "egg", name: "Haşlanmış Yumurta", unit: "adet", kcalPer: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: "chicken", name: "Izgara Tavuk Göğsü", unit: "100g", kcalPer: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "rice", name: "Pişmiş Pirinç", unit: "100g", kcalPer: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "yogurt", name: "Süzme Yoğurt", unit: "100g", kcalPer: 97, protein: 9, carbs: 4, fat: 5 },
  { id: "banana", name: "Muz", unit: "adet", kcalPer: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "almonds", name: "Badem", unit: "30g", kcalPer: 174, protein: 6.4, carbs: 6.1, fat: 15 },
  { id: "salmon", name: "Somon (Izgara)", unit: "100g", kcalPer: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "bread", name: "Tam Buğday Ekmeği", unit: "dilim", kcalPer: 82, protein: 4, carbs: 14, fat: 1.1 },
  { id: "cheese", name: "Beyaz Peynir", unit: "30g", kcalPer: 75, protein: 5.4, carbs: 0.6, fat: 5.7 },
];

const GOALS = { kcal: 2600, protein: 180, carbs: 280, fat: 80 };
const WATER_GOAL = 8;

const INITIAL_FOOD_LOG = [
  { id: 1, meal: "Kahvaltı", name: "Yulaf Ezmesi", portion: "80g", kcal: 311, protein: 13.5, carbs: 52.8, fat: 5.5 },
  { id: 2, meal: "Kahvaltı", name: "Haşlanmış Yumurta", portion: "2 adet", kcal: 156, protein: 12.6, carbs: 1.2, fat: 10.6 },
  { id: 3, meal: "Öğle Yemeği", name: "Izgara Tavuk Göğsü", portion: "200g", kcal: 330, protein: 62, carbs: 0, fat: 7.2 },
  { id: 4, meal: "Öğle Yemeği", name: "Pişmiş Pirinç", portion: "150g", kcal: 195, protein: 4.1, carbs: 42, fat: 0.5 },
  { id: 5, meal: "Atıştırmalık", name: "Badem", portion: "30g", kcal: 174, protein: 6.4, carbs: 6.1, fat: 15 },
];

function formatNum(n) {
  const r = Math.round(n * 10) / 10;
  return (Number.isInteger(r) ? String(r) : r.toFixed(1)).replace(".", ",");
}

function plateColor(kg) {
  if (kg >= 120) return { bg: "#E8412C", text: "#FFFFFF", label: "25 KG DİSK" };
  if (kg >= 80) return { bg: "#2F6FED", text: "#FFFFFF", label: "20 KG DİSK" };
  if (kg >= 50) return { bg: "#E8B72C", text: "#1A1B1E", label: "15 KG DİSK" };
  if (kg >= 25) return { bg: "#3CAA5C", text: "#FFFFFF", label: "10 KG DİSK" };
  return { bg: "#C7C9CE", text: "#1A1B1E", label: "5 KG DİSK" };
}

function ringColor(pct) {
  if (pct > 1.03) return "#E8412C";
  if (pct >= 0.85) return "#3CAA5C";
  return "#2F6FED";
}

function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const start = prevRef.current;
    const startTime = performance.now();
    let raf;
    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (value - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = value;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{formatNum(display)}</>;
}

function Sparkline({ data, color, width = 60, height = 22 }) {
  const values = data.map((d) => d.kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="fit-card px-2 py-3 flex flex-col items-center">
      <span className="font-mono-data text-sm" style={{ color: "var(--text)" }}>{value}</span>
      <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", textAlign: "center" }}>{label}</span>
    </div>
  );
}

const TABS = [
  { id: "exercises", label: "Hareketler", icon: Dumbbell },
  { id: "nutrition", label: "Beslenme", icon: Utensils },
  { id: "progress", label: "İlerleme", icon: Activity },
  { id: "profile", label: "Profil", icon: User },
];

export default function FitnessDemo() {
  const [exercises, setExercises] = useState(INITIAL_EXERCISES);
  const [activeTab, setActiveTab] = useState("exercises");
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("Tümü");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState({ weight: 0, reps: 5, sets: 3 });
  const [prCelebration, setPrCelebration] = useState(false);

  const [foodLog, setFoodLog] = useState(INITIAL_FOOD_LOG);
  const [foodSheetOpen, setFoodSheetOpen] = useState(false);
  const [foodDraft, setFoodDraft] = useState({ query: "", selectedFood: null, quantity: 1, meal: "Kahvaltı" });
  const [waterCount, setWaterCount] = useState(5);

  function toggleWater(i) {
    setWaterCount((prev) => (i + 1 === prev ? i : i + 1));
  }

  const selectedEx = exercises.find((e) => e.id === selectedId);

  const filtered = exercises.filter((ex) => {
    const matchesMuscle = muscleFilter === "Tümü" || ex.muscle === muscleFilter;
    const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
    return matchesMuscle && matchesQuery;
  });

  function openDetail(id) {
    setSelectedId(id);
    setScreen("detail");
  }

  function openSheet() {
    const ex = exercises.find((e) => e.id === selectedId);
    const lastKg = ex.history[ex.history.length - 1].kg;
    setDraft({ weight: lastKg, reps: 5, sets: 3 });
    setSheetOpen(true);
  }

  function bump(delta) {
    setDraft((d) => ({ ...d, weight: Math.max(0, +(d.weight + delta).toFixed(2)) }));
  }

  function saveEntry() {
    const wasNewPR = selectedEx && draft.weight > selectedEx.pr;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== selectedId) return ex;
        const newPoint = { d: "Şimdi", kg: draft.weight, reps: draft.reps, sets: draft.sets };
        return { ...ex, history: [...ex.history, newPoint], pr: Math.max(ex.pr, draft.weight), lastDate: "Bugün" };
      })
    );
    if (wasNewPR) {
      setPrCelebration(true);
      setTimeout(() => setPrCelebration(false), 2200);
    }
    setSheetOpen(false);
  }

  function openFoodSheet(meal) {
    setFoodDraft({ query: "", selectedFood: null, quantity: 1, meal: meal || "Kahvaltı" });
    setFoodSheetOpen(true);
  }

  function saveFoodEntry() {
    if (!foodDraft.selectedFood) return;
    const f = foodDraft.selectedFood;
    const q = foodDraft.quantity;
    const entry = {
      id: Date.now(),
      meal: foodDraft.meal,
      name: f.name,
      portion: `${q} ${f.unit}`,
      kcal: Math.round(f.kcalPer * q),
      protein: +(f.protein * q).toFixed(1),
      carbs: +(f.carbs * q).toFixed(1),
      fat: +(f.fat * q).toFixed(1),
    };
    setFoodLog((prev) => [...prev, entry]);
    setFoodSheetOpen(false);
  }

  const totals = foodLog.reduce(
    (acc, e) => ({ kcal: acc.kcal + e.kcal, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const kcalPct = totals.kcal / GOALS.kcal;
  const filteredFoods = FOOD_DB.filter((f) => f.name.toLowerCase().includes(foodDraft.query.toLowerCase()));

  return (
    <div className="fit-app min-h-screen relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .fit-app {
          --bg: #17181B;
          --surface: #212226;
          --surface-2: #292A2F;
          --text: #F5F4F0;
          --text-muted: #8B8D93;
          --red: #E8412C;
          --blue: #2F6FED;
          --yellow: #E8B72C;
          --green: #3CAA5C;
          --border: rgba(255,255,255,0.08);
          font-family: 'Inter', sans-serif;
          background-color: var(--bg);
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0);
          background-size: 22px 22px;
          color: var(--text);
        }
        .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .font-mono-data { font-family: 'JetBrains Mono', monospace; }

        .fit-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; }
        .fit-input { background: var(--surface); border: 1px solid var(--border); }
        .fit-tag { font-size: 11px; padding: 2px 9px; border-radius: 9999px; background: rgba(255,255,255,0.06); color: var(--text-muted); }

        .fit-chip { padding: 6px 14px; border-radius: 9999px; font-size: 13px; border: 1px solid var(--border); color: var(--text-muted); background: var(--surface); white-space: nowrap; transition: all .2s; }
        .fit-chip[data-active="true"] { background: var(--red); color: #fff; border-color: var(--red); }

        .plate-badge { width: 56px; height: 56px; border-radius: 9999px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.35);
          transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
        .plate-badge::after { content: ''; position: absolute; inset: 6px; border-radius: 9999px; border: 2px solid rgba(255,255,255,0.15); }
        button:active .plate-badge, .plate-badge:active { transform: rotate(14deg) scale(0.94); }

        .plate-badge-lg { width: 140px; height: 140px; border-radius: 9999px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
          box-shadow: inset 0 4px 8px rgba(255,255,255,0.25), inset 0 -6px 12px rgba(0,0,0,0.28), 0 10px 24px rgba(0,0,0,0.4); }
        .plate-badge-lg::after { content: ''; position: absolute; inset: 14px; border-radius: 9999px; border: 3px solid rgba(255,255,255,0.15); }
        .plate-badge-lg::before { content: ''; position: absolute; inset: 30px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.1); }

        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card-enter { animation: cardIn 0.5s cubic-bezier(.16,1,.3,1) both; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: flex-end; justify-content: center; z-index: 30; animation: fadeIn .25s ease both; }
        .sheet-panel { width: 100%; max-width: 384px; background: var(--surface-2); border-radius: 24px 24px 0 0; padding: 14px 20px 28px; animation: sheetUp .35s cubic-bezier(.16,1,.3,1) both; }
        .sheet-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 9999px; margin: 0 auto 16px; }

        .stepper-btn { width: 40px; height: 40px; border-radius: 9999px; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text); transition: transform .15s; }
        .stepper-btn:active { transform: scale(0.9); }
        .quick-chip { padding: 5px 10px; border-radius: 9999px; background: var(--surface); border: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--text-muted); transition: transform .15s; }
        .quick-chip:active { transform: scale(0.95); }
        .field-label { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; display: block; letter-spacing: 0.05em; }
        .mini-btn { width: 32px; height: 32px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); color: var(--text); }
        .save-btn { width: 100%; padding: 14px; border-radius: 16px; background: var(--red); color: #fff; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform .15s; }
        .save-btn:active { transform: scale(0.97); }

        .bar-track { width: 100%; height: 6px; border-radius: 9999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 9999px; transition: width .6s cubic-bezier(.16,1,.3,1); }
        .add-food-btn { width: 26px; height: 26px; border-radius: 9999px; background: var(--surface); border: 1px solid var(--border); color: var(--text); display: flex; align-items: center; justify-content: center; }

        .water-btn { width: 44px; height: 44px; border-radius: 9999px; background: var(--blue); color: #fff; display: flex; align-items: center; justify-content: center; border: none; transition: transform .15s; box-shadow: 0 4px 12px rgba(47,111,237,0.4); }
        .water-btn:active { transform: scale(0.9); }
        @keyframes dropPop { 0% { opacity: .4; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
        .drop-row { animation: dropPop .3s ease both; }

        @keyframes prPop { 0% { opacity: 0; transform: translateY(10px) scale(0.8); } 60% { opacity: 1; transform: translateY(-4px) scale(1.05); } 100% { transform: translateY(0) scale(1); } }
        .pr-badge { position: absolute; top: -6px; display: flex; align-items: center; gap: 6px; background: var(--yellow); color: #1A1B1E; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; animation: prPop .5s cubic-bezier(.34,1.56,.64,1) both; z-index: 5; }

        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; align-items: center; padding: 10px 0 calc(10px + env(safe-area-inset-bottom)); background: rgba(23,24,27,0.92); backdrop-filter: blur(12px); border-top: 1px solid var(--border); z-index: 20; }
        .nav-btn { display: flex; flex-direction: column; align-items: center; padding: 6px 8px; background: none; border: none; }

        .fab { position: fixed; right: 20px; bottom: 84px; width: 56px; height: 56px; border-radius: 9999px; background: var(--red); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(232,65,44,0.45); z-index: 20; transition: transform .2s; border: none; }
        .fab:active { transform: scale(0.92); }

        .avatar-circle { width: 72px; height: 72px; border-radius: 9999px; background: linear-gradient(135deg, var(--red), var(--yellow)); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #fff; }

        .fit-app button:focus-visible, .fit-app input:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }

        @media (prefers-reduced-motion: reduce) {
          .fit-app *, .fit-app *::before, .fit-app *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <div className="max-w-sm mx-auto relative">
        {/* ---------- EXERCISES TAB ---------- */}
        {activeTab === "exercises" && screen === "list" && (
          <>
            <div className="sticky top-0 z-10 px-5 pt-6 pb-4" style={{ background: "linear-gradient(to bottom, var(--bg) 75%, transparent)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Merhaba,</p>
                  <h1 className="font-display text-3xl" style={{ color: "var(--text)" }}>EMRE</h1>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-full fit-input">
                  <Flame size={14} style={{ color: "var(--red)" }} />
                  <span className="font-mono-data" style={{ fontSize: "12px", color: "var(--text)" }}>5 gün</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fit-input mb-3">
                <Search size={16} style={{ color: "var(--text-muted)" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hareket ara..."
                  className="bg-transparent outline-none w-full text-sm"
                  style={{ color: "var(--text)" }}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {MUSCLES.map((m) => (
                  <button key={m} onClick={() => setMuscleFilter(m)} className="fit-chip shrink-0" data-active={muscleFilter === m}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 flex flex-col gap-3 pb-28 pt-2">
              {filtered.map((ex, i) => {
                const last = ex.history[ex.history.length - 1];
                const prev = ex.history[ex.history.length - 2];
                const trend = prev ? (last.kg > prev.kg ? "up" : last.kg < prev.kg ? "down" : "flat") : "flat";
                const colors = plateColor(last.kg);
                return (
                  <button
                    key={ex.id}
                    onClick={() => openDetail(ex.id)}
                    className="fit-card card-enter flex items-center gap-4 p-4 text-left w-full"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="plate-badge shrink-0" style={{ background: colors.bg, color: colors.text }}>
                      <span className="font-display" style={{ fontSize: "18px", lineHeight: 1 }}>{formatNum(last.kg)}</span>
                      <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.85 }}>KG</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: "var(--text)", fontSize: "15px" }}>{ex.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="fit-tag">{ex.muscle}</span>
                        <span className="font-mono-data" style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.lastDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Sparkline data={ex.history.slice(-6)} color={colors.bg} />
                      {trend === "up" && <TrendingUp size={12} style={{ color: "var(--green)" }} />}
                      {trend === "down" && <TrendingDown size={12} style={{ color: "var(--red)" }} />}
                      {trend === "flat" && <Minus size={12} style={{ color: "var(--text-muted)" }} />}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                  <p className="text-sm">Aradığın hareket bulunamadı.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "exercises" && screen === "detail" && selectedEx && (
          <div className="px-5 pt-6 pb-28">
            <button onClick={() => setScreen("list")} className="flex items-center gap-1 mb-6" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft size={18} />
              <span className="text-sm">Hareketler</span>
            </button>

            {(() => {
              const last = selectedEx.history[selectedEx.history.length - 1];
              const colors = plateColor(last.kg);
              return (
                <>
                  <div className="flex flex-col items-center text-center mb-6 relative">
                    {prCelebration && (
                      <div className="pr-badge">
                        <Trophy size={14} /> Yeni Rekor!
                      </div>
                    )}
                    <div className="plate-badge-lg" style={{ background: colors.bg, color: colors.text }}>
                      <span className="font-display" style={{ fontSize: "40px", lineHeight: 1 }}>
                        <CountUp value={last.kg} />
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.85 }}>KG</span>
                    </div>
                    <h2 className="font-display mt-4" style={{ fontSize: "26px", color: "var(--text)" }}>{selectedEx.name.toUpperCase()}</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{selectedEx.muscle} · {selectedEx.equipment}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>En yakın yarışma diski: {colors.label}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <StatBox label="Rekor (PR)" value={`${formatNum(selectedEx.pr)} kg`} />
                    <StatBox label="Son Kayıt" value={selectedEx.lastDate} />
                    <StatBox label="Toplam Kayıt" value={selectedEx.history.length} />
                  </div>

                  <div className="fit-card p-4 mb-6" style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedEx.history}>
                        <defs>
                          <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.bg} stopOpacity={0.5} />
                            <stop offset="100%" stopColor={colors.bg} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="d" tick={{ fill: "#8B8D93", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[(dataMin) => Math.max(0, dataMin - 10), (dataMax) => dataMax + 10]} />
                        <Tooltip
                          contentStyle={{ background: "#292A2F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "12px" }}
                          labelStyle={{ color: "#8B8D93" }}
                          formatter={(v) => [`${formatNum(v)} kg`, "Ağırlık"]}
                        />
                        <Area type="monotone" dataKey="kg" stroke={colors.bg} strokeWidth={2.5} fill="url(#fillArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <h3 className="font-semibold mb-3" style={{ color: "var(--text)" }}>Son Kayıtlar</h3>
                  <div className="flex flex-col gap-2">
                    {[...selectedEx.history].reverse().slice(0, 5).map((h, i) => (
                      <div key={i} className="flex items-center justify-between fit-card px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div style={{ width: "8px", height: "8px", borderRadius: "9999px", background: colors.bg }} />
                          <span className="font-mono-data text-sm" style={{ color: "var(--text)" }}>{h.d}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono-data text-sm" style={{ color: "var(--text-muted)" }}>
                          <span>{h.sets}x{h.reps}</span>
                          <span style={{ color: "var(--text)", fontWeight: 600 }}>{formatNum(h.kg)} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ---------- NUTRITION TAB ---------- */}
        {activeTab === "nutrition" && (
          <div className="px-5 pt-6 pb-28">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bugün</p>
            <h1 className="font-display text-2xl mb-5" style={{ color: "var(--text)" }}>BESLENME</h1>

            <div className="flex flex-col items-center mb-6">
              <div className="relative flex items-center justify-center" style={{ width: "160px", height: "160px" }}>
                <svg width="160" height="160" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="80" cy="80" r="72" fill="none"
                    stroke={ringColor(kcalPct)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 - Math.min(kcalPct, 1) * 2 * Math.PI * 72}
                    style={{ transition: "stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)" }}
                  />
                </svg>
                <div className="plate-badge-lg" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
                  <span className="font-display" style={{ fontSize: "32px", lineHeight: 1 }}><CountUp value={totals.kcal} /></span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>/ {GOALS.kcal} KCAL</span>
                </div>
              </div>
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                {totals.kcal <= GOALS.kcal
                  ? `${Math.round(GOALS.kcal - totals.kcal)} kcal kaldı`
                  : `${Math.round(totals.kcal - GOALS.kcal)} kcal aşıldı`}
              </p>
            </div>

            <div className="fit-card p-4 mb-5 flex flex-col gap-4">
              {[
                { label: "Protein", consumed: totals.protein, goal: GOALS.protein, color: "var(--red)" },
                { label: "Karbonhidrat", consumed: totals.carbs, goal: GOALS.carbs, color: "var(--blue)" },
                { label: "Yağ", consumed: totals.fat, goal: GOALS.fat, color: "var(--yellow)" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: "var(--text)" }}>{m.label}</span>
                    <span className="font-mono-data" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {formatNum(m.consumed)} / {m.goal} g
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.min(100, (m.consumed / m.goal) * 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="fit-card p-4 mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Su</span>
                  <span className="font-mono-data" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {waterCount}/{WATER_GOAL} bardak{waterCount > WATER_GOAL ? ` (+${waterCount - WATER_GOAL})` : ""}
                  </span>
                </div>
                <div key={waterCount} className="drop-row flex gap-1.5">
                  {Array.from({ length: WATER_GOAL }).map((_, i) => {
                    const filled = i < waterCount;
                    return (
                      <button key={i} onClick={() => toggleWater(i)} style={{ lineHeight: 0 }}>
                        <Droplet
                          size={18}
                          fill={filled ? "var(--blue)" : "none"}
                          stroke={filled ? "var(--blue)" : "var(--text-muted)"}
                          strokeWidth={1.8}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => setWaterCount((c) => Math.min(WATER_GOAL + 6, c + 1))} className="water-btn">
                <Plus size={20} />
              </button>
            </div>

            {MEALS.map((meal) => {
              const entries = foodLog.filter((e) => e.meal === meal);
              return (
                <div key={meal} className="fit-card p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{meal}</span>
                    <button onClick={() => openFoodSheet(meal)} className="add-food-btn"><Plus size={14} /></button>
                  </div>
                  {entries.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Henüz kayıt yok</p>
                  ) : (
                    entries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2" style={{ borderTop: "1px solid var(--border)" }}>
                        <div>
                          <p className="text-sm" style={{ color: "var(--text)" }}>{e.name}</p>
                          <p className="font-mono-data" style={{ fontSize: "11px", color: "var(--text-muted)" }}>{e.portion}</p>
                        </div>
                        <span className="font-mono-data text-sm" style={{ color: "var(--text)" }}>{e.kcal} kcal</span>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ---------- PROGRESS TAB ---------- */}
        {activeTab === "progress" && (
          <div className="px-5 pt-6 pb-28">
            <h1 className="font-display text-2xl mb-1" style={{ color: "var(--text)" }}>İLERLEME</h1>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Tüm hareketlerdeki rekorların</p>
            <div className="grid grid-cols-2 gap-3">
              {exercises.map((ex, i) => {
                const colors = plateColor(ex.pr);
                return (
                  <div key={ex.id} className="fit-card p-4 flex flex-col items-center text-center card-enter" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="plate-badge mb-2" style={{ background: colors.bg, color: colors.text }}>
                      <span className="font-display" style={{ fontSize: "16px", lineHeight: 1 }}>{formatNum(ex.pr)}</span>
                      <span style={{ fontSize: "8px", fontWeight: 700, opacity: 0.85 }}>KG</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{ex.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{ex.muscle}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- PROFILE TAB ---------- */}
        {activeTab === "profile" && (
          <div className="px-5 pt-10 pb-28 flex flex-col items-center text-center">
            <div className="avatar-circle mb-4">E</div>
            <h2 className="font-display text-2xl" style={{ color: "var(--text)" }}>EMRE</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Üyelik: Şubat 2026</p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <StatBox label="Toplam Hareket" value={exercises.length} />
              <StatBox label="Toplam Kayıt" value={exercises.reduce((s, e) => s + e.history.length, 0)} />
            </div>
          </div>
        )}

        {((activeTab === "exercises" && screen === "detail") || activeTab === "nutrition") && (
          <button onClick={() => (activeTab === "exercises" ? openSheet() : openFoodSheet())} className="fab">
            <Plus size={24} />
          </button>
        )}

        <div className="bottom-nav">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); if (t.id === "exercises") setScreen("list"); }}
                className="nav-btn"
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} style={{ color: active ? "var(--red)" : "var(--text-muted)" }} />
                <span style={{ fontSize: "10px", marginTop: "3px", fontWeight: active ? 600 : 400, color: active ? "var(--text)" : "var(--text-muted)" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {sheetOpen && selectedEx && (
          <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
            <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold" style={{ color: "var(--text)" }}>Yeni Kayıt</h3>
                <button onClick={() => setSheetOpen(false)}>
                  <X size={20} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{selectedEx.name}</p>

              <div className="flex items-center justify-center gap-5 mb-5">
                <button onClick={() => bump(-2.5)} className="stepper-btn"><Minus size={18} /></button>
                <div className="text-center" style={{ minWidth: "110px" }}>
                  <span className="font-display" style={{ fontSize: "44px", color: "var(--text)" }}>{formatNum(draft.weight)}</span>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>KG</p>
                </div>
                <button onClick={() => bump(2.5)} className="stepper-btn"><Plus size={18} /></button>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[-5, -1.25, 1.25, 5, 10].map((d) => (
                  <button key={d} onClick={() => bump(d)} className="quick-chip">{d > 0 ? `+${d}` : d}</button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="field-label">Set</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDraft((d) => ({ ...d, sets: Math.max(1, d.sets - 1) }))} className="mini-btn">-</button>
                    <span className="font-mono-data text-base flex-1 text-center" style={{ color: "var(--text)" }}>{draft.sets}</span>
                    <button onClick={() => setDraft((d) => ({ ...d, sets: d.sets + 1 }))} className="mini-btn">+</button>
                  </div>
                </div>
                <div>
                  <label className="field-label">Tekrar</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDraft((d) => ({ ...d, reps: Math.max(1, d.reps - 1) }))} className="mini-btn">-</button>
                    <span className="font-mono-data text-base flex-1 text-center" style={{ color: "var(--text)" }}>{draft.reps}</span>
                    <button onClick={() => setDraft((d) => ({ ...d, reps: d.reps + 1 }))} className="mini-btn">+</button>
                  </div>
                </div>
              </div>

              <button onClick={saveEntry} className="save-btn">
                <Check size={18} /> Kaydet
              </button>
            </div>
          </div>
        )}

        {foodSheetOpen && (
          <div className="sheet-backdrop" onClick={() => setFoodSheetOpen(false)}>
            <div className="sheet-panel" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "82vh", overflowY: "auto" }}>
              <div className="sheet-handle" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "var(--text)" }}>Besin Ekle</h3>
                <button onClick={() => setFoodSheetOpen(false)}>
                  <X size={20} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto mb-4">
                {MEALS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setFoodDraft((d) => ({ ...d, meal: m }))}
                    className="fit-chip shrink-0"
                    data-active={foodDraft.meal === m}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {!foodDraft.selectedFood ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fit-input mb-3">
                    <Search size={16} style={{ color: "var(--text-muted)" }} />
                    <input
                      value={foodDraft.query}
                      onChange={(e) => setFoodDraft((d) => ({ ...d, query: e.target.value }))}
                      placeholder="Besin ara (tavuk, pirinç...)"
                      className="bg-transparent outline-none w-full text-sm"
                      style={{ color: "var(--text)" }}
                    />
                  </div>
                  <div className="flex flex-col gap-2" style={{ maxHeight: "220px", overflowY: "auto" }}>
                    {filteredFoods.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFoodDraft((d) => ({ ...d, selectedFood: f, quantity: 1 }))}
                        className="fit-card flex items-center justify-between px-4 py-3 text-left w-full"
                      >
                        <span className="text-sm" style={{ color: "var(--text)" }}>{f.name}</span>
                        <span className="font-mono-data" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{f.kcalPer} kcal / {f.unit}</span>
                      </button>
                    ))}
                    {filteredFoods.length === 0 && (
                      <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Sonuç bulunamadı.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setFoodDraft((d) => ({ ...d, selectedFood: null }))} className="text-sm mb-4" style={{ color: "var(--blue)" }}>
                    ← Aramaya dön
                  </button>
                  <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>{foodDraft.selectedFood.name}</p>
                  <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{foodDraft.selectedFood.kcalPer} kcal / {foodDraft.selectedFood.unit}</p>

                  <div className="flex items-center justify-center gap-5 mb-5">
                    <button onClick={() => setFoodDraft((d) => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))} className="stepper-btn"><Minus size={18} /></button>
                    <div className="text-center" style={{ minWidth: "110px" }}>
                      <span className="font-display" style={{ fontSize: "40px", color: "var(--text)" }}>{foodDraft.quantity}</span>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{foodDraft.selectedFood.unit}</p>
                    </div>
                    <button onClick={() => setFoodDraft((d) => ({ ...d, quantity: d.quantity + 1 }))} className="stepper-btn"><Plus size={18} /></button>
                  </div>

                  <div className="fit-card p-3 mb-6 flex justify-around text-center">
                    <div>
                      <p className="font-mono-data text-sm" style={{ color: "var(--text)" }}>{Math.round(foodDraft.selectedFood.kcalPer * foodDraft.quantity)}</p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>kcal</p>
                    </div>
                    <div>
                      <p className="font-mono-data text-sm" style={{ color: "var(--red)" }}>{(foodDraft.selectedFood.protein * foodDraft.quantity).toFixed(1)}g</p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>protein</p>
                    </div>
                    <div>
                      <p className="font-mono-data text-sm" style={{ color: "var(--blue)" }}>{(foodDraft.selectedFood.carbs * foodDraft.quantity).toFixed(1)}g</p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>karb.</p>
                    </div>
                    <div>
                      <p className="font-mono-data text-sm" style={{ color: "var(--yellow)" }}>{(foodDraft.selectedFood.fat * foodDraft.quantity).toFixed(1)}g</p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>yağ</p>
                    </div>
                  </div>

                  <button onClick={saveFoodEntry} className="save-btn">
                    <Check size={18} /> Kaydet
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
