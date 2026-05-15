import { useState, useEffect, useRef } from 'react';
import {
    Droplets,
    Fan,
    Lightbulb,
    Sparkles,
    Thermometer,
    Droplet,
    SunMedium,
} from 'lucide-react';
import { database } from './firebase.js';
import { ref, onValue } from 'firebase/database';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import HeroMetricCard from './components/HeroMetricCard.jsx';
import { plantProfiles } from './data/plantProfile.js';

import PlantDatabase from './components/plantDatabase.jsx';
import HardwareDiagnostics from './components/HardwareDiagnostics.jsx';
import Analytics from './components/Analytics.jsx';
import Settings from './components/setting.jsx';
import AuthScreen from './components/AuthScreen.jsx';

function ToggleRow({ icon: Icon, label, on, onToggle }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/30 px-3 py-2.5 transition-colors">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-cyan-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-cyan-400/90">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onToggle(!on)}
                className={`relative h-8 w-14 shrink-0 rounded-full border transition ${on
                        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-emerald-500/80 dark:to-cyan-500/70 shadow-neon'
                        : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80'
                    }`}
            >
                <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${on ? 'left-7' : 'left-1'
                        }`}
                />
            </button>
        </div>
    );
}

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');

    const [globalActiveProfile, setGlobalActiveProfile] = useState(() => {
        const savedProfile = localStorage.getItem('vertiSync_activeProfile');
        return savedProfile ? savedProfile : 'Malaysian Bok Choy';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vertiSync_theme') || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('vertiSync_activeProfile', globalActiveProfile);
    }, [globalActiveProfile]);

    useEffect(() => {
        localStorage.setItem('vertiSync_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const [irrigation, setIrrigation] = useState(true);
    const [fans, setFans] = useState(false);
    const [lights, setLights] = useState(true);

    const [currentMoisture, setCurrentMoisture] = useState(38);
    const [isPumpActive, setIsPumpActive] = useState(false);
    const [healthAnalysisStatus, setHealthAnalysisStatus] = useState('idle');
    const [healthResult, setHealthResult] = useState({ score: 0, status: '', details: [], badgeClass: '', boxClass: '' });

    const [moistureHistory, setMoistureHistory] = useState(() => Array(30).fill(38));
    const [currentTemp, setCurrentTemp] = useState(24);
    const [tempHistory, setTempHistory] = useState(() => Array(30).fill(24));
    const [currentHumidity, setCurrentHumidity] = useState(65);

    // AI Prediction States
    const [evaporationRate, setEvaporationRate] = useState(0.28);
    const [timeToDryness, setTimeToDryness] = useState('2h 15m');
    const [currentPh, setCurrentPh] = useState(6.2);

    const currentMoistureRef = useRef(currentMoisture);
    const currentTempRef = useRef(currentTemp);
    useEffect(() => {
        currentMoistureRef.current = currentMoisture;
        currentTempRef.current = currentTemp;
    }, [currentMoisture, currentTemp]);

    useEffect(() => {
        const historyTimer = setInterval(() => {
            setMoistureHistory((prev) => [...prev.slice(1), currentMoistureRef.current]);
            setTempHistory((prev) => [...prev.slice(1), currentTempRef.current]);
        }, 1000);
        return () => clearInterval(historyTimer);
    }, []);

    useEffect(() => {
        const moistureRef = ref(database, 'sensor_readings/soil_moisture');
        const tempRef = ref(database, 'sensor_readings/temperature');
        const humidityRef = ref(database, 'sensor_readings/humidity');
        const phRef = ref(database, 'sensor_readings/ph');

        const unsubscribeMoisture = onValue(moistureRef, (snapshot) => {
            const liveMoisture = snapshot.val();
            if (liveMoisture !== null) {
                setCurrentMoisture(liveMoisture);
            }
        });

        const unsubscribeTemp = onValue(tempRef, (snapshot) => {
            const liveTemp = snapshot.val();
            if (liveTemp !== null) {
                setCurrentTemp(liveTemp);
            }
        });

        const unsubscribeHumidity = onValue(humidityRef, (snapshot) => {
            const liveHumidity = snapshot.val();
            if (liveHumidity !== null) {
                setCurrentHumidity(liveHumidity);
            }
        });

        const unsubscribePh = onValue(phRef, (snapshot) => {
            const livePh = snapshot.val();
            if (livePh !== null) {
                setCurrentPh(livePh);
            }
        });

        return () => {
            unsubscribeMoisture();
            unsubscribeTemp();
            unsubscribeHumidity();
            unsubscribePh();
        };
    }, []);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('vertiSync_auth') === 'true';
    });

    // Calculate AI Predictive Dryness
    useEffect(() => {
        // Basic AI heuristic model for evaporation
        const currentHour = new Date().getHours();
        const isDaytime = currentHour >= 6 && currentHour <= 18;
        const timeFactor = isDaytime ? 1.2 : 0.8; // Evaporates faster during the day
        
        // Evaporation increases with temperature and decreases with humidity
        const tempFactor = Math.max(0.1, currentTemp / 25);
        const humidityFactor = Math.max(0.1, 50 / Math.max(1, currentHumidity));
        
        // Base rate ~ 0.2% per minute under nominal conditions (25C, 50% hum)
        const rawRate = 0.2 * tempFactor * humidityFactor * timeFactor;
        const simulatedRate = Math.max(0.01, parseFloat(rawRate.toFixed(2)));
        
        setEvaporationRate(simulatedRate);
        
        const CRITICAL_DRYNESS_THRESHOLD = 20; // 20% moisture is considered critically dry
        const moistureDiff = currentMoisture - CRITICAL_DRYNESS_THRESHOLD;
        
        if (moistureDiff <= 0) {
            setTimeToDryness('Critically Dry');
        } else {
            const minutesToDry = moistureDiff / simulatedRate;
            const hours = Math.floor(minutesToDry / 60);
            const mins = Math.floor(minutesToDry % 60);
            
            if (hours > 72) {
                setTimeToDryness('> 3 Days');
            } else {
                setTimeToDryness(`${hours}h ${mins}m`);
            }
        }
    }, [currentTemp, currentHumidity, currentMoisture]);

    // The simulated evaporation and pump timers have been removed 
    // since data is now arriving directly from the ESP32 via Firebase!

    const handlePumpStart = () => setIsPumpActive(true);
    const handlePumpEnd = () => setIsPumpActive(false);

    const handleRunHealthAnalysis = () => {
        setHealthAnalysisStatus('analyzing');
        
        setTimeout(() => {
            const savedCustom = JSON.parse(localStorage.getItem('vs_customPlants') || '[]');
            const allPlants = [...plantProfiles, ...savedCustom];
            const activeCrop = allPlants.find(p => p.name === globalActiveProfile) || allPlants[0];
            
            const tempMatch = activeCrop.tempRange ? activeCrop.tempRange.match(/(\d+)/g) : null;
            const targetMinTemp = tempMatch ? parseInt(tempMatch[0]) : 20;
            const targetMaxTemp = tempMatch ? parseInt(tempMatch[1]) : 25;
            
            const phMatch = activeCrop.phRange ? activeCrop.phRange.match(/(\d+\.\d+)/g) : null;
            const targetMinPh = phMatch && phMatch.length >= 2 ? parseFloat(phMatch[0]) : 5.5;
            const targetMaxPh = phMatch && phMatch.length >= 2 ? parseFloat(phMatch[1]) : 6.5;

            let score = 100;
            let details = [];

            // Temp Check
            if (currentTemp > targetMaxTemp) {
                score -= 15;
                details.push(`High Temp (${currentTemp.toFixed(1)}°C). Target: <${targetMaxTemp}°C.`);
            } else if (currentTemp < targetMinTemp) {
                score -= 15;
                details.push(`Low Temp (${currentTemp.toFixed(1)}°C). Target: >${targetMinTemp}°C.`);
            } else {
                details.push(`Temp optimal.`);
            }

            // Moisture Check
            if (currentMoisture < 30) {
                score -= 20;
                details.push(`Soil Dry (${currentMoisture}%). Needs irrigation.`);
            } else if (currentMoisture > 80) {
                score -= 10;
                details.push(`Soil very wet (${currentMoisture}%). Allow to drain.`);
            } else {
                details.push(`Moisture optimal.`);
            }

            // pH Check
            if (currentPh > targetMaxPh) {
                score -= 10;
                details.push(`High pH (${currentPh.toFixed(1)}). Target: <${targetMaxPh}.`);
            } else if (currentPh < targetMinPh) {
                score -= 10;
                details.push(`Low pH (${currentPh.toFixed(1)}). Target: >${targetMinPh}.`);
            } else {
                details.push(`pH optimal.`);
            }
            
            // Humidity Check (generic)
            if (currentHumidity < 40) {
                score -= 5;
                details.push(`Low humidity (${currentHumidity}%).`);
            } else if (currentHumidity > 80) {
                score -= 5;
                details.push(`High humidity (${currentHumidity}%).`);
            }

            let status = 'Excellent';
            let badgeClass = 'text-[#00FF66] border-[#00FF66] bg-[#00FF66]/10';
            let boxClass = 'border-[#00FF66]/50 bg-emerald-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(0,255,102,0.15)]';
            
            if (score < 60) {
                status = 'Critical';
                badgeClass = 'text-rose-500 border-rose-500 bg-rose-500/10';
                boxClass = 'border-rose-500/50 bg-rose-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
            } else if (score < 85) {
                status = 'Warning';
                badgeClass = 'text-amber-500 border-amber-500 bg-amber-500/10';
                boxClass = 'border-amber-500/50 bg-amber-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            }

            setHealthResult({ score, status, details, badgeClass, boxClass });
            setHealthAnalysisStatus('complete');
        }, 2000);
    };

    const handleResetHealthAnalysis = () => {
        setHealthAnalysisStatus('idle');
    };

    return (
        <>
            {/* If the user is NOT authenticated, show the login screen */}
            {!isAuthenticated ? (
                <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
            ) : (
                <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
                    {/* PASS THE ROUTING PROPS TO THE SIDEBAR */}
                    <Sidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        currentView={currentView}
                        onNavigate={setCurrentView}
                    />

                    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto md:pl-0">
                        <TopNav
                            onMenuClick={() => setSidebarOpen((o) => !o)}
                            sidebarOpen={sidebarOpen}
                            globalActiveProfile={globalActiveProfile}
                            setGlobalActiveProfile={setGlobalActiveProfile}
                        />

                        <div className="scroll-bento flex-1 px-4 pb-8 pt-4 md:px-6 md:pt-5">
                            <div className="mx-auto max-w-[1400px]">
                                {/* Desktop subheader: pump status */}
                                <div className="mb-4 hidden items-center justify-end md:flex">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none transition-colors">
                                        Water Pump:{' '}
                                        <span className="font-semibold text-amber-400 tabular-nums">
                                            STANDBY
                                        </span>
                                    </div>
                                </div>

                                {/* THE MAGIC SWITCH LOGIC */}
                                {currentView === 'dashboard' ? (
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                        {/* Active Hydration Matrix */}
                                        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                                            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Active Hydration Matrix
                                            </h2>

                                            <div className="mt-4 flex flex-1 flex-col">
                                                <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/40 p-8 shadow-sm dark:shadow-none transition-colors">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 shadow-neon-cyan">
                                                            <Droplets className="h-9 w-9" strokeWidth={1.5} />
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Current Soil Moisture
                                                        </p>
                                                        <p className="mt-1 bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                                                            {currentMoisture}%
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/40 px-3 py-2 transition-colors">
                                                    <div className="relative w-full">
                                                        <svg
                                                            viewBox="0 0 320 72"
                                                            className="w-full h-16 md:h-[4.5rem]"
                                                            preserveAspectRatio="none"
                                                            aria-hidden
                                                        >
                                                            <defs>
                                                                <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                                                    <feMerge>
                                                                        <feMergeNode in="blur" />
                                                                        <feMergeNode in="SourceGraphic" />
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <polyline
                                                                points={moistureHistory.map((val, i) => {
                                                                    const pad = 4;
                                                                    const w = 320;
                                                                    const h = 72;
                                                                    const step = (w - pad * 2) / Math.max(1, moistureHistory.length - 1);
                                                                    const x = pad + i * step;
                                                                    const y = pad + (1 - val / 100) * (h - pad * 2);
                                                                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                                                                }).join(' ')}
                                                                fill="none"
                                                                stroke="#00E5FF"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                filter="url(#chartGlow)"
                                                                className="drop-shadow-[0_0_8px_rgba(0,229,255,0.45)]"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Current Temperature Box */}
                                                <div className="relative mt-8 overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-white via-slate-50 to-purple-50/50 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-purple-950/40 p-8 shadow-sm dark:shadow-none transition-colors">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-300 shadow-neon-purple">
                                                            <Thermometer className="h-9 w-9" strokeWidth={1.5} />
                                                        </div>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            Current Temperature
                                                        </p>
                                                        <p className="mt-1 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                                                            {currentTemp.toFixed(1)}°C
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/40 px-3 py-2 transition-colors">
                                                    <div className="relative w-full">
                                                        <svg
                                                            viewBox="0 0 320 72"
                                                            className="w-full h-16 md:h-[4.5rem]"
                                                            preserveAspectRatio="none"
                                                            aria-hidden
                                                        >
                                                            <defs>
                                                                <filter id="tempChartGlow" x="-20%" y="-20%" width="140%" height="140%">
                                                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                                                    <feMerge>
                                                                        <feMergeNode in="blur" />
                                                                        <feMergeNode in="SourceGraphic" />
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <polyline
                                                                points={tempHistory.map((val, i) => {
                                                                    const pad = 4;
                                                                    const w = 320;
                                                                    const h = 72;
                                                                    const step = (w - pad * 2) / Math.max(1, tempHistory.length - 1);
                                                                    const x = pad + i * step;
                                                                    // Map 20-30 degree range to 0-100% for the chart
                                                                    const normalized = (val - 20) / 10;
                                                                    const clamped = Math.max(0, Math.min(1, normalized));
                                                                    const y = pad + (1 - clamped) * (h - pad * 2);
                                                                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                                                                }).join(' ')}
                                                                fill="none"
                                                                stroke="#c084fc"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                filter="url(#tempChartGlow)"
                                                                className="drop-shadow-[0_0_8px_rgba(192,132,252,0.45)]"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-center md:hidden">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none transition-colors">
                                                        Water Pump:{' '}
                                                        <span className="font-semibold text-amber-400">
                                                            STANDBY
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* AI Predictive Irrigation Engine */}
                                        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-5 lg:col-start-8 lg:row-start-1">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 shadow-neon-cyan">
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-sm font-medium leading-snug text-slate-600 dark:text-slate-400">
                                                        AI Predictive Irrigation Engine
                                                    </h2>
                                                </div>
                                            </div>

                                            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Estimated Time to Critical Dryness
                                            </p>
                                            <p className={`mt-1 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent ${
                                                timeToDryness === 'Critically Dry' 
                                                    ? 'from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400' 
                                                    : 'from-emerald-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400'
                                            }`}>
                                                {timeToDryness}
                                            </p>

                                            <div className="mt-5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400">Evaporation Rate</span>
                                                    <span className="font-mono text-cyan-600 dark:text-cyan-400">{evaporationRate}%/min</span>
                                                </div>
                                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 transition-colors">
                                                    <div 
                                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 dark:from-cyan-400 dark:to-emerald-400 shadow-neon-cyan transition-all duration-1000 ease-out" 
                                                        style={{ width: `${Math.min(100, (evaporationRate / 1.0) * 100)}%` }} 
                                                    />
                                                </div>
                                            </div>

                                            {healthAnalysisStatus === 'idle' && (
                                                <button
                                                    type="button"
                                                    onClick={handleRunHealthAnalysis}
                                                    className="mt-6 w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-900/80"
                                                >
                                                    Run AI Plant Health Analysis
                                                </button>
                                            )}

                                            {healthAnalysisStatus === 'analyzing' && (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/50 py-3 text-sm font-medium text-slate-400 transition-all duration-200 cursor-not-allowed"
                                                >
                                                    <div className="h-4 w-4 animate-[spin_1s_linear_infinite] rounded-full border-2 border-slate-300 dark:border-slate-400 border-t-cyan-500 dark:border-t-cyan-400" />
                                                    Evaluating Crop Condition...
                                                </button>
                                            )}

                                            {healthAnalysisStatus === 'complete' && (
                                                <div className={`mt-6 rounded-2xl border p-4 backdrop-blur-md transition-all duration-200 ${healthResult.boxClass}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2" title={globalActiveProfile}>{globalActiveProfile}</span>
                                                        <span className={`shrink-0 inline-block rounded border px-2 py-0.5 text-xs font-bold ${healthResult.badgeClass}`}>
                                                            {healthResult.status} ({healthResult.score}%)
                                                        </span>
                                                    </div>
                                                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3 list-disc pl-4">
                                                        {healthResult.details.map((d, i) => <li key={i}>{d}</li>)}
                                                    </ul>
                                                    <div className="text-center mt-3">
                                                        <button
                                                            onClick={handleResetHealthAnalysis}
                                                            className="text-xs font-medium text-slate-500 transition-colors hover:text-cyan-500 underline decoration-slate-400 hover:decoration-cyan-500 underline-offset-2"
                                                        >
                                                            Recalculate Health
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <p className="mt-4 text-center text-xs italic text-slate-500 md:text-left">
                                                Monitoring crop vitals against target parameters...
                                            </p>
                                        </section>

                                        {/* Command Center */}
                                        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-5 lg:col-start-8 lg:row-start-2">
                                            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Command Center / Manual Overrides
                                            </h2>

                                            <div className="mt-4 flex flex-col gap-3">
                                                <ToggleRow
                                                    icon={Droplets}
                                                    label="Automated Irrigation Loop"
                                                    on={irrigation}
                                                    onToggle={setIrrigation}
                                                />
                                                <ToggleRow
                                                    icon={Fan}
                                                    label="Cooling Fans"
                                                    on={fans}
                                                    onToggle={setFans}
                                                />
                                                <ToggleRow
                                                    icon={Lightbulb}
                                                    label="LED Grow Lights"
                                                    on={lights}
                                                    onToggle={setLights}
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onMouseDown={handlePumpStart}
                                                onMouseUp={handlePumpEnd}
                                                onMouseLeave={handlePumpEnd}
                                                onTouchStart={handlePumpStart}
                                                onTouchEnd={handlePumpEnd}
                                                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm uppercase tracking-wide shadow-neon transition-all duration-200 active:scale-[0.99] ${isPumpActive
                                                        ? 'bg-[#00E5FF] text-black font-bold'
                                                        : 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold hover:brightness-110'
                                                    }`}
                                            >
                                                <Droplet className="h-5 w-5" strokeWidth={2.2} />
                                                {isPumpActive ? 'PUMP ACTIVE' : 'Manual Pump Override (Hold)'}
                                            </button>
                                        </section>

                                        {/* Environmental overview */}
                                        <section className="rounded-3xl border border-slate-200 bg-white/40 dark:border-slate-800/80 dark:bg-slate-900/40 p-5 shadow-lg dark:shadow-none backdrop-blur-sm transition-colors lg:col-span-12 lg:col-start-1 lg:row-start-3">
                                            <h2 className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Simulated Environmental Overview
                                            </h2>
                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                                                <HeroMetricCard
                                                    icon={Thermometer}
                                                    label="Ambient Temp"
                                                    value={`${currentTemp.toFixed(1)}°C`}
                                                    status="Optimal"
                                                    variant="purple"
                                                />
                                                <HeroMetricCard
                                                    icon={Droplets}
                                                    label="Humidity"
                                                    value={`${currentHumidity}%`}
                                                    status="Optimal"
                                                    variant="teal"
                                                />
                                                <HeroMetricCard
                                                    icon={Droplet}
                                                    label="Water pH"
                                                    value={`${currentPh.toFixed(1)}`}
                                                    status="Slightly Acidic"
                                                    statusClassName="text-amber-400"
                                                    variant="yellow"
                                                />
                                                <HeroMetricCard
                                                    icon={SunMedium}
                                                    label="Light Spectrum"
                                                    value="Veg"
                                                    status="Vegetative Mode"
                                                    statusClassName="text-emerald-400"
                                                    variant="lime"
                                                />
                                            </div>
                                        </section>
                                    </div>
                                ) : currentView === 'plants' ? (
                                    /* RENDER THE PLANT DATABASE WHEN SELECTED */
                                    <PlantDatabase 
                                        activeProfile={globalActiveProfile}
                                        setGlobalActiveProfile={setGlobalActiveProfile} 
                                        currentTemp={currentTemp} 
                                        currentPh={currentPh} 
                                    />
                                ) : currentView === 'hardware' ? (
                                    /* RENDER THE HARDWARE DIAGNOSTICS WHEN SELECTED */
                                    <HardwareDiagnostics />
                                ) : currentView === 'analytics' ? (
                                    /* RENDER THE ANALYTICS WHEN SELECTED */
                                    <Analytics activeProfile={globalActiveProfile} />
                                ) : currentView === 'settings' ? (
                                    /* RENDER THE SETTINGS WHEN SELECTED */
                                    <Settings theme={theme} setTheme={setTheme} />
                                ) : (
                                    /* Fallback for other pages */
                                    <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
                                        <p className="text-lg text-slate-500">
                                            Module "{currentView}" is currently offline.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
