import { useState,useEffect } from 'react';
import {
  Droplets,
  Fan,
  Lightbulb,
  Sparkles,
  Thermometer,
  Droplet,
  SunMedium,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import HeroMetricCard from './components/HeroMetricCard.jsx';
import ChartRow from './components/ChartRow.jsx';
import PlantDatabase from  './components/plantDatabase.jsx';
import HardwareDiagnostics from './components/HardwareDiagnostics.jsx';
import Analytics from './components/Analytics.jsx';

function ToggleRow({ icon: Icon, label, on, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/30 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-cyan-400/90">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span className="truncate text-sm font-medium text-slate-200">{label}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onToggle(!on)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition ${
          on
            ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/80 to-cyan-500/70 shadow-neon'
            : 'border-slate-700 bg-slate-800/80'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${
            on ? 'left-7' : 'left-1'
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

  useEffect(() => {
      localStorage.setItem('vertiSync_activeProfile', globalActiveProfile);
    }, [globalActiveProfile]);
  const [irrigation, setIrrigation] = useState(true);
  const [fans, setFans] = useState(false);
  const [lights, setLights] = useState(true);

  const [currentMoisture, setCurrentMoisture] = useState(38);
  const [isPumpActive, setIsPumpActive] = useState(false);
  const [harvestState, setHarvestState] = useState('idle');

  useEffect(() => {
    if (isPumpActive) return;
    const evaporationTimer = setInterval(() => {
      setCurrentMoisture((prev) => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(evaporationTimer);
  }, [isPumpActive]);

  useEffect(() => {
    if (!isPumpActive) return;
    const pumpTimer = setInterval(() => {
      setCurrentMoisture((prev) => Math.min(99, prev + 2));
    }, 100);
    return () => clearInterval(pumpTimer);
  }, [isPumpActive]);

  const handlePumpStart = () => setIsPumpActive(true);
  const handlePumpEnd = () => setIsPumpActive(false);

  const handleCalculateHarvest = () => {
    setHarvestState('calculating');
    setTimeout(() => {
      setHarvestState('complete');
    }, 2500);
  };

  const handleResetHarvest = () => {
    setHarvestState('idle');
  };

  return (
      <div className="flex min-h-screen bg-slate-950">

        {/* 3. PASS THE ROUTING PROPS TO THE SIDEBAR */}
        <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentView={currentView}
            onNavigate={setCurrentView}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-0">
            <TopNav
                onMenuClick={() => setSidebarOpen((o) => !o)}
                sidebarOpen={sidebarOpen}
                globalActiveProfile={globalActiveProfile}
                setGlobalActiveProfile={setGlobalActiveProfile}
            />

          <div className="scroll-bento flex-1 overflow-y-auto px-4 pb-8 pt-4 md:px-6 md:pt-5">
            <div className="mx-auto max-w-[1400px]">

              {/* Desktop subheader: pump status */}
              <div className="mb-4 hidden items-center justify-end md:flex">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-400">
                  Water Pump:{' '}
                  <span className="font-semibold text-amber-400 tabular-nums">STANDBY</span>
                </div>
              </div>

              {/* 4. THE MAGIC SWITCH LOGIC */}
              {currentView === 'dashboard' ? (

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Active Hydration Matrix */}
                    <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                      <h2 className="text-sm font-medium text-slate-400">Active Hydration Matrix</h2>

                      <div className="mt-4 flex flex-1 flex-col">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 p-8">
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-neon-cyan">
                              <Droplets className="h-9 w-9" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm text-slate-400">Current Soil Moisture</p>
                            <p className="mt-1 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                              {currentMoisture}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-800/60 bg-slate-950/40 px-3 py-2">
                          <ChartRow />
                        </div>

                        <div className="mt-4 flex justify-center md:hidden">
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-400">
                            Water Pump:{' '}
                            <span className="font-semibold text-amber-400">STANDBY</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* AI Predictive Irrigation Engine */}
                    <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-5 lg:col-start-8 lg:row-start-1">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-300 shadow-neon-cyan">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-medium leading-snug text-slate-400">
                            AI Predictive Irrigation Engine
                          </h2>
                        </div>
                      </div>

                      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Estimated Time to Critical Dryness
                      </p>
                      <p className="mt-1 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
                        2h 15m
                      </p>

                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Evaporation Rate</span>
                          <span className="font-mono text-cyan-400">0.28%/min</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-neon-cyan" />
                        </div>
                      </div>

                      {harvestState === 'idle' && (
                        <button
                            type="button"
                            onClick={handleCalculateHarvest}
                            className="mt-6 w-full rounded-2xl border border-slate-700 bg-slate-950/50 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-600 hover:bg-slate-900/80"
                        >
                          Calculate Harvest Window
                        </button>
                      )}

                      {harvestState === 'calculating' && (
                        <button
                            type="button"
                            disabled
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/50 py-3 text-sm font-medium text-slate-400 transition-all duration-200 cursor-not-allowed"
                        >
                          <div className="h-4 w-4 animate-[spin_1s_linear_infinite] rounded-full border-2 border-slate-400 border-t-cyan-400" />
                          Analyzing Growth Data...
                        </button>
                      )}

                      {harvestState === 'complete' && (
                        <div className="mt-6 rounded-2xl border border-[#00FF66] bg-slate-950/60 p-4 shadow-[0_0_15px_rgba(0,255,102,0.15)] backdrop-blur-md transition-all duration-200">
                          <p className="text-center font-medium text-slate-200">Optimal Harvest: May 12th - 14th</p>
                          <div className="mt-2 flex justify-center">
                            <span className="inline-block rounded border border-[#00FF66]/30 bg-[#00FF66]/10 px-2 py-0.5 text-xs font-semibold text-[#00FF66]">
                              AI Confidence: 94%
                            </span>
                          </div>
                          <div className="mt-3 text-center">
                            <button 
                              onClick={handleResetHarvest}
                              className="text-xs text-slate-500 transition-colors hover:text-[#00FF66] underline decoration-slate-600 hover:decoration-[#00FF66]/50 underline-offset-2"
                            >
                              Recalculate
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="mt-4 text-center text-xs italic text-slate-500 md:text-left">
                        Optimizing water delivery for maximum yield...
                      </p>
                    </section>

                    {/* Command Center */}
                    <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-5 lg:col-start-8 lg:row-start-2">
                      <h2 className="text-sm font-medium text-slate-400">Command Center / Manual Overrides</h2>

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
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm uppercase tracking-wide shadow-neon transition-all duration-200 active:scale-[0.99] ${
                            isPumpActive 
                              ? 'bg-[#00E5FF] text-black font-bold' 
                              : 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold hover:brightness-110'
                          }`}
                      >
                        <Droplet className="h-5 w-5" strokeWidth={2.2} />
                        {isPumpActive ? 'PUMP ACTIVE' : 'Manual Pump Override (Hold)'}
                      </button>
                    </section>

                    {/* Environmental overview */}
                    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm lg:col-span-12 lg:col-start-1 lg:row-start-3">
                      <h2 className="mb-4 text-sm font-medium text-slate-400">
                        Simulated Environmental Overview
                      </h2>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        <HeroMetricCard
                            icon={Thermometer}
                            label="Ambient Temp"
                            value="24°C"
                            status="Optimal"
                            variant="purple"
                        />
                        <HeroMetricCard
                            icon={Droplets}
                            label="Humidity"
                            value="65%"
                            status="Optimal"
                            variant="teal"
                        />
                        <HeroMetricCard
                            icon={Droplet}
                            label="Water pH"
                            value="6.2"
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

                  /* 5. RENDER THE PLANT DATABASE WHEN SELECTED */
                  <PlantDatabase setGlobalActiveProfile={setGlobalActiveProfile} />
              ) : currentView === 'hardware' ? (
                  
                  /* 6. RENDER THE HARDWARE DIAGNOSTICS WHEN SELECTED */
                  <HardwareDiagnostics />
                  
              ) : currentView === 'analytics' ? (

                  /* 7. RENDER THE ANALYTICS WHEN SELECTED */
                  <Analytics />

              ) : (

                  /* Fallback for other pages */
                  <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
                    <p className="text-lg text-slate-500">Module "{currentView}" is currently offline.</p>
                  </div>

              )}

            </div>
          </div>
        </div>
      </div>
  );
}
