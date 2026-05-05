import { useState } from 'react';
import { Thermometer, Droplet, SunMedium, Sparkles, Sprout } from 'lucide-react';
import { plantProfiles } from '../data/plantProfile.js';

export default function PlantDatabase() {
    // Load the data and set the first item as the default active crop
    const [activeCrop, setActiveCrop] = useState(plantProfiles[0]);

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
                                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                    isActive
                                        ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 shadow-neon'
                                        : 'border border-slate-800/60 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                            >
                                {crop.name}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Right Panel: The Details */}
            <section className="flex flex-col gap-6 lg:w-2/3">

                {/* Growth Recipe */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-5 text-xl font-bold text-white">
                        {activeCrop.name} <span className="text-slate-500 font-medium">| Target Thresholds</span>
                    </h2>

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
                </div>

                {/* AI Prediction */}
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-300 shadow-neon-cyan">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-200">AI Lifecycle Prediction</h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Current Phase</p>
                            <p className="mt-1 text-xl font-bold text-white">{activeCrop.stage}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Harvest Window</p>
                            <p className="mt-1 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                {activeCrop.estimatedHarvestDays} Days
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-sm font-semibold text-emerald-400 mb-1">Nutrient Action Required:</p>
                        <p className="text-sm text-slate-300">{activeCrop.nutrientAdvice}</p>
                    </div>
                </div>

            </section>
        </div>
    );
}