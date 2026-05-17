import React from 'react';
import { Bot, Droplets, Fan, Lightbulb, Droplet } from 'lucide-react';

function ToggleRow({ icon: Icon, label, on, onToggle, disabled = false }) {
    return (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/30 px-3 py-2.5 transition-colors ${disabled ? 'opacity-60 grayscale' : ''}`}>
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
                disabled={disabled}
                onClick={() => !disabled && onToggle(!on)}
                className={`relative h-8 w-14 shrink-0 rounded-full border transition ${on && !disabled
                        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-emerald-500/80 dark:to-cyan-500/70 shadow-neon'
                        : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${on ? 'left-7' : 'left-1'
                        }`}
                />
            </button>
        </div>
    );
}

export default function CommandCenter({
    autopilot,
    setAutopilot,
    irrigation,
    setIrrigation,
    fans,
    setFans,
    lights,
    setLights,
    isPumpActive,
    handlePumpStart,
    handlePumpEnd
}) {
    return (
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:col-span-5 lg:col-start-8 lg:row-start-2">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Command Center
                </h2>
                <div className="flex items-center gap-2">
                    <Bot className={`h-4 w-4 ${autopilot ? 'text-cyan-500' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Autopilot</span>
                    <button
                        type="button"
                        onClick={() => setAutopilot(!autopilot)}
                        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${autopilot ? 'border-cyan-500/50 bg-cyan-500 shadow-neon-cyan' : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80'}`}
                    >
                        <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${autopilot ? 'left-[1.125rem]' : 'left-0.5'}`} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <ToggleRow
                    icon={Droplets}
                    label="Automated Irrigation Loop"
                    on={irrigation}
                    onToggle={setIrrigation}
                    disabled={autopilot}
                />
                <ToggleRow
                    icon={Fan}
                    label="Cooling Fans"
                    on={fans}
                    onToggle={setFans}
                    disabled={autopilot}
                />
                <ToggleRow
                    icon={Lightbulb}
                    label="LED Grow Lights"
                    on={lights}
                    onToggle={setLights}
                    disabled={autopilot}
                />
            </div>

            <button
                type="button"
                onMouseDown={!autopilot ? handlePumpStart : undefined}
                onMouseUp={!autopilot ? handlePumpEnd : undefined}
                onMouseLeave={!autopilot ? handlePumpEnd : undefined}
                onTouchStart={!autopilot ? handlePumpStart : undefined}
                onTouchEnd={!autopilot ? handlePumpEnd : undefined}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm uppercase tracking-wide shadow-neon transition-all duration-200 active:scale-[0.99] ${autopilot && isPumpActive
                        ? 'bg-purple-500 text-white font-bold shadow-neon-purple'
                        : isPumpActive
                        ? 'bg-[#00E5FF] text-black font-bold'
                        : 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold hover:brightness-110'
                    } ${autopilot ? 'cursor-not-allowed opacity-90' : ''}`}
            >
                <Droplet className="h-5 w-5" strokeWidth={2.2} />
                {isPumpActive ? (autopilot ? 'AI PUMP OVERRIDE ACTIVE' : 'PUMP ACTIVE') : 'Manual Pump Override (Hold)'}
            </button>
        </section>
    );
}
