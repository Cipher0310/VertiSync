import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PredictiveEngine({
    weatherData,
    timeToDryness,
    evaporationRate,
    healthAnalysisStatus,
    handleRunHealthAnalysis,
    healthResult,
    globalActiveProfile,
    handleResetHealthAnalysis
}) {
    return (
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 shadow-neon-cyan">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-sm font-medium leading-snug text-slate-600 dark:text-slate-400">
                        AI Predictive Irrigation Engine
                        {weatherData && <span className="ml-2 inline-flex items-center rounded-full bg-cyan-100/50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">Weather-Adjusted</span>}
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
    );
}
