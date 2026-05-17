import React from 'react';
import { Droplets, Thermometer } from 'lucide-react';

export default function HydrationMatrix({ currentMoisture, moistureHistory, currentTemp, tempHistory }) {
    // Determine temperature color based on value
    const getTempColor = (temp) => {
        if (temp > 28) return 'linear-gradient(to top, #ef4444, #f97316)'; // Red/Orange
        if (temp < 20) return 'linear-gradient(to top, #3b82f6, #06b6d4)'; // Blue/Cyan
        return 'linear-gradient(to top, #10b981, #84cc16)'; // Green/Lime
    };

    return (
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Hydration & Climate Matrix
            </h2>

            <div className="mt-4 flex flex-1 flex-col">
                {/* Current Soil Moisture Box */}
                <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/40 p-8 shadow-sm dark:shadow-none transition-colors">


                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50/80 dark:bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 shadow-neon-cyan backdrop-blur-md transition-colors">
                            <Droplets className="h-9 w-9" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Current Soil Moisture
                        </p>
                        <p className="mt-1 bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-300 dark:to-emerald-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl drop-shadow-sm">
                            {currentMoisture}%
                        </p>
                    </div>
                </div>

                {/* Moisture Chart */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/40 px-3 py-2 transition-colors relative z-10">
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
                    


                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-50/80 dark:bg-purple-500/20 text-purple-500 dark:text-purple-300 shadow-neon-purple backdrop-blur-md transition-colors">
                            <Thermometer className="h-9 w-9" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            Current Temperature
                        </p>
                        <p className="mt-1 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl drop-shadow-sm">
                            {currentTemp.toFixed(1)}°C
                        </p>
                    </div>
                </div>

                {/* Temperature Chart */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/40 px-3 py-2 transition-colors relative z-10">
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
            </div>
        </section>
    );
}
