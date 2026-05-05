import { useState, useEffect } from 'react';
import {
    Thermometer, Droplet, SunMedium, Sparkles, Sprout,
    Play, Loader2, Activity, RefreshCw, Bug, FlaskConical
} from 'lucide-react';

// Import the static plant catalog we created
import { plantProfiles } from '../data/plantProfile.js';

export default function PlantDatabase() {
    const hasData = Array.isArray(plantProfiles) && plantProfiles.length > 0;
    const [activeCrop, setActiveCrop] = useState(hasData ? plantProfiles[0] : null);

    // --- NEW: Live Environment State (from Database/API) ---
    const [liveEnv, setLiveEnv] = useState({ temp: 0, ph: 0 });
    const [isEnvLoading, setIsEnvLoading] = useState(true);

    // --- AI State ---
    const [aiStatus, setAiStatus] = useState('standby');
    const [aiResult, setAiResult] = useState({ days: 0, advice: "" });

    // 1. Fetch the live environment data from your backend
    const fetchLiveEnvironment = () => {
        setIsEnvLoading(true);
        fetch('/api/farm-data')
            .then((res) => res.json())
            .then((data) => {
                // Use optional chaining (?.) so IntelliJ knows these might be undefined
                const fetchedTemp = data?.temperature || data?.temperature || 25.0;
                const fetchedPh = data?.waterPh || 6.0;

                setLiveEnv({
                    temp: parseFloat(fetchedTemp),
                    ph: parseFloat(fetchedPh)
                });
                setIsEnvLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching live environment from DB:", err);
                // Fallback for hackathon demo if backend is offline
                setLiveEnv({ temp: 24.0, ph: 6.2 });
                setIsEnvLoading(false);
            });
    };

    // Fetch on mount
    useEffect(() => {
        fetchLiveEnvironment();
    }, []);

    // Reset AI when crop changes or new data is fetched
    useEffect(() => {
        setAiStatus('standby');
    }, [activeCrop, liveEnv]);


    // 2. The AI Logic Engine (Now using Live Data)
    const runAiAnalysis = () => {
        setAiStatus('analyzing');

        setTimeout(() => {
            let dynamicAdvice = "";
            let adjustedDays = activeCrop.estimatedHarvestDays;

            // Extract numeric targets from the profile string
            const tempMatch = activeCrop.tempRange.match(/(\d+)/g);
            const targetMinTemp = tempMatch ? parseInt(tempMatch[0]) : 20;
            const targetMaxTemp = tempMatch ? parseInt(tempMatch[1]) : 25;

            const phMatch = activeCrop.phRange.match(/(\d+\.\d+)/g);
            const targetMaxPh = phMatch ? parseFloat(phMatch[1]) : 6.5;
            const targetMinPh = phMatch ? parseFloat(phMatch[0]) : 5.5;

            // Evaluate Live Temp vs Target Temp
            if (liveEnv.temp > targetMaxTemp) {
                dynamicAdvice += `⚠️ Heat stress risk (${liveEnv.temp}°C). Activating cooling fans. Reducing Nitrogen concentration. `;
                adjustedDays += 2;
            } else if (liveEnv.temp < targetMinTemp) {
                dynamicAdvice += `⚠️ Temp below optimal. Root absorption slowed. Delaying feed schedule. `;
                adjustedDays += 3;
            } else {
                dynamicAdvice += `✅ Temp is optimal. `;
            }

            // Evaluate Live pH vs Target pH
            if (liveEnv.ph > targetMaxPh) {
                dynamicAdvice += `Alkaline pH (${liveEnv.ph}) detected. Dispensing 5ml 'pH Down' into reservoir.`;
            } else if (liveEnv.ph < targetMinPh) {
                dynamicAdvice += `Acidic pH (${liveEnv.ph}) detected. Dispensing 'pH Up' to prevent nutrient lockout.`;
            } else {
                dynamicAdvice += `Proceeding with standard ${activeCrop.stage} feed: ${activeCrop.nutrientAdvice}`;
            }

            setAiResult({ days: adjustedDays, advice: dynamicAdvice });
            setAiStatus('complete');
        }, 1500);
    };

    if (!hasData || !activeCrop) return <div className="text-red-400 p-6">Data Connection Error.</div>;

    const getDifficultyColor = (level) => {
        if (level === 'Beginner') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        if (level === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    };

    return (
        <div className="flex flex-col gap-6 lg:flex-row">

            {/* Left Sidebar: The Catalog */}
            <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:w-1/3">
                <div className="mb-4 flex items-center gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <Sprout className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-200">Crop Library</h2>
                </div>

                <div className="flex flex-col gap-3">
                    {plantProfiles.map((crop) => {
                        const isActive = activeCrop.id === crop.id;
                        return (
                            <button
                                key={crop.id}
                                onClick={() => setActiveCrop(crop)}
                                className={`flex items-center justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                    isActive
                                        ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 shadow-neon'
                                        : 'border border-slate-800/60 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                            >
                                {/* Tiny image thumbnail in the sidebar */}
                                <img
                                    src={crop.imageUrl}
                                    alt={crop.name}
                                    className={`h-8 w-8 rounded-full object-cover border-2 ${isActive ? 'border-emerald-400' : 'border-slate-700'}`}
                                />
                                {crop.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Right Panel: The Details */}
            <section className="flex flex-col gap-6 lg:w-2/3">

                {/* Growth Recipe Targets */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">

                    {/* UPDATED HEADER WITH IMAGE AND BADGE */}
                    <div className="flex items-center gap-5 mb-6 border-b border-slate-800/80 pb-5">
                        {activeCrop.imageUrl ? (
                            <img
                                src={activeCrop.imageUrl}
                                alt={activeCrop.name}
                                className="h-20 w-20 rounded-2xl object-cover shadow-lg border border-slate-700"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <Sprout className="h-8 w-8 text-slate-500" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">{activeCrop.name}</h2>
                                {activeCrop.difficulty && (
                                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(activeCrop.difficulty)}`}>
                                        {activeCrop.difficulty}
                                    </span>
                                )}
                            </div>
                            <span className="text-slate-500 font-medium tracking-wide text-sm uppercase">Agronomy & Target Thresholds</span>
                        </div>
                    </div>

                    {/* Standard Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 text-center">
                            <Thermometer className="mb-2 h-6 w-6 text-violet-400" />
                            <p className="text-xs text-slate-500">Target Temp</p>
                            <p className="mt-1 text-lg font-bold text-slate-200">{activeCrop.tempRange}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 text-center">
                            <Droplet className="mb-2 h-6 w-6 text-amber-400" />
                            <p className="text-xs text-slate-500">Target pH</p>
                            <p className="mt-1 text-lg font-bold text-slate-200">{activeCrop.phRange}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 text-center">
                            <SunMedium className="mb-2 h-6 w-6 text-lime-400" />
                            <p className="text-xs text-slate-500">Light Cycle</p>
                            <p className="mt-1 text-lg font-bold text-slate-200">{activeCrop.lightCycle}</p>
                        </div>
                    </div>

                    {/* NEW THREAT & N-P-K SECTION */}
                    {activeCrop.topThreat && activeCrop.npkRatio && (
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Threat Alert Banner */}
                            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                                    <Bug className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Top Bio-Threat</p>
                                    <p className="text-sm text-slate-300">{activeCrop.topThreat}</p>
                                </div>
                            </div>

                            {/* NPK Ratio Visualizer */}
                            <div className="flex flex-col justify-center rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <FlaskConical className="h-4 w-4 text-cyan-400" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nutrient Ratio (N-P-K)</span>
                                </div>
                                {activeCrop.npkRatio.n === 0 && activeCrop.npkRatio.p === 0 ? (
                                    <p className="text-sm text-slate-500 italic">Relies on seed energy (Zero nutrients)</p>
                                ) : (
                                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                        <div style={{ width: `${activeCrop.npkRatio.n}%` }} className="bg-emerald-400" title="Nitrogen" />
                                        <div style={{ width: `${activeCrop.npkRatio.p}%` }} className="bg-amber-400" title="Phosphorus" />
                                        <div style={{ width: `${activeCrop.npkRatio.k}%` }} className="bg-violet-400" title="Potassium" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* INTERACTIVE AI PREDICTION ENGINE */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-300 shadow-neon-cyan">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-200">Dynamic AI Lifecycle Analysis</h2>
                        </div>

                        <button
                            onClick={runAiAnalysis}
                            disabled={aiStatus === 'analyzing'}
                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-neon-cyan transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {aiStatus === 'analyzing' ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                <><Play className="h-4 w-4 fill-current" /> Run AI Analysis</>
                            )}
                        </button>
                    </div>

                    {/* LIVE ENVIRONMENT SENSOR FEED */}
                    <div className="mb-5 flex gap-4 rounded-2xl border border-slate-700 bg-slate-800/30 p-4 relative overflow-hidden">
                        <div className="absolute top-2 right-3 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Sensor Feed</span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Current Temp</label>
                            <div className="flex items-center gap-2">
                                {isEnvLoading ? <Loader2 className="h-5 w-5 animate-spin text-cyan-400" /> : <span className="text-2xl font-mono text-cyan-400">{liveEnv.temp}°C</span>}
                            </div>
                        </div>

                        <div className="w-px bg-slate-700 mx-2"></div>

                        <div className="flex flex-1 flex-col justify-center">
                            <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Current pH</label>
                            <div className="flex items-center gap-2">
                                {isEnvLoading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-400" /> : <span className="text-2xl font-mono text-emerald-400">{liveEnv.ph}</span>}
                            </div>
                        </div>

                        <button onClick={fetchLiveEnvironment} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 my-auto ml-2 group" title="Refresh Sensor Data">
                            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        </button>
                    </div>

                    {/* AI Results Reveal Area */}
                    <div className="flex flex-col gap-4 relative">
                        {aiStatus === 'standby' && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/60 backdrop-blur-[2px]">
                                <p className="text-sm text-cyan-400 tracking-widest uppercase font-medium animate-pulse">Awaiting Analysis</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Growth Phase</p>
                                <p className="mt-1 text-xl font-bold text-white">{activeCrop.stage}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Adjusted Harvest</p>
                                <p className={`mt-1 text-2xl font-bold ${aiStatus === 'complete' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-600'}`}>
                                    {aiStatus === 'complete' ? `${aiResult.days} Days` : '-- Days'}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-2xl border p-4 transition-all duration-500 ${
                            aiStatus === 'complete' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/40'
                        }`}>
                            <p className={`text-sm font-semibold mb-1 flex items-center gap-2 ${aiStatus === 'complete' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                System Action Executed:
                            </p>
                            <p className={aiStatus === 'complete' ? 'text-slate-200 leading-relaxed' : 'text-slate-600'}>
                                {aiStatus === 'complete' ? aiResult.advice : "Run analysis to cross-reference target thresholds with live sensor data..."}
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}