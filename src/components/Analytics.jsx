import React, { useState } from 'react';
import {
  Download,
  Droplet,
  Zap,
  Leaf,
  Sprout,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function Analytics({ activeProfile = 'Malaysian Bok Choy' }) {
  const [activeChartToggle, setActiveChartToggle] = useState('Water'); // 'Water' or 'Electricity'

  // Mock data for AI Harvest Prediction based on activeProfile
  const profileData = {
    'Hydroponic Spinach': { yield: '11.2 kg', growth: 76 },
    'Malaysian Bok Choy': { yield: '14.5 kg', growth: 82 },
    'Microgreens Blend': { yield: '3.8 kg', growth: 95 },
    'Cherry Tomatoes': { yield: '8.4 kg', growth: 45 },
    'Sweet Basil': { yield: '6.2 kg', growth: 60 }
  };

  const currentCropData = profileData[activeProfile] || { yield: '12.0 kg', growth: 50 };

  // Chronologically sorted mock data for the 30-day trend chart
  const consumptionData = [
    { date: 'Jan 01', water: 45, electricity: 60 },
    { date: 'Jan 05', water: 52, electricity: 58 },
    { date: 'Jan 10', water: 38, electricity: 65 },
    { date: 'Jan 15', water: 65, electricity: 72 },
    { date: 'Jan 20', water: 48, electricity: 55 },
    { date: 'Jan 25', water: 55, electricity: 68 },
    { date: 'Jan 30', water: 42, electricity: 62 },
  ];

  // Helper to find the maximum value for chart scaling
  const maxWater = Math.max(...consumptionData.map((d) => d.water));
  const maxElectricity = Math.max(...consumptionData.map((d) => d.electricity));
  const currentMax = activeChartToggle === 'Water' ? maxWater : maxElectricity;

  const anomalyLogs = [
    {
      time: '02:14 AM',
      action: 'Auto-dosed pH Buffer',
      reason: 'pH dropped to 5.6',
    },
    {
      time: '04:30 AM',
      action: 'Reduced LED Intensity (20%)',
      reason: 'Ambient thermal threshold exceeded',
    },
    {
      time: '08:15 AM',
      action: 'Irrigation Cycle Shifted',
      reason: 'AI detected early saturation',
    },
    {
      time: '11:45 AM',
      action: 'Ventilation Fan Boost',
      reason: 'Humidity spiked to 85%',
    },
  ];

  const handleDownloadCSV = () => {
    // 1. Define CSV headers
    const headers = ['Date', 'Water Consumption (L)', 'Electricity Consumption (kWh)'];
    
    // 2. Map data rows
    const csvRows = consumptionData.map(row => {
      return `${row.date},${row.water},${row.electricity}`;
    });

    // 3. Combine headers and rows
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 4. Create a Blob and generate a URL
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 5. Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vertisync-resource-report.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Analytics & Predictive Yield
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            System performance metrics and AI crop forecasting
          </p>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="group flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20 hover:shadow-neon-cyan"
        >
          <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Download Report (CSV)
        </button>
      </div>

      {/* Top Row - Impact KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1 */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-colors hover:border-cyan-500/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-neon-cyan">
            <Droplet className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Water Saved
            </p>
            <p className="text-2xl font-bold text-white">
              1,240 <span className="text-sm font-medium text-cyan-400">L</span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-colors hover:border-emerald-500/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-neon">
            <Zap className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Energy Efficiency
            </p>
            <p className="text-2xl font-bold text-white">
              94<span className="text-sm font-medium text-emerald-400">%</span>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-md transition-colors hover:border-purple-500/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-neon-purple">
            <Leaf className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Est. Carbon Reduction
            </p>
            <p className="text-2xl font-bold text-white">
              42 <span className="text-sm font-medium text-purple-400">kg CO2</span>
            </p>
          </div>
        </div>
      </div>

      {/* Middle Full Width - Resource Consumption Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-400" />
            Resource Consumption (30-Day Trend)
          </h2>
          
          {/* Custom Toggle Switch */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950/50 p-1">
            <button
              onClick={() => setActiveChartToggle('Water')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                activeChartToggle === 'Water'
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-neon-cyan border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Water
            </button>
            <button
              onClick={() => setActiveChartToggle('Electricity')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                activeChartToggle === 'Electricity'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-neon border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Electricity
            </button>
          </div>
        </div>

        {/* Mock CSS Bar Chart */}
        <div className="relative mt-8 h-64 w-full">
          {/* Y-Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[4, 3, 2, 1, 0].map((line) => (
              <div key={line} className="flex w-full items-center">
                <span className="w-8 shrink-0 text-right text-[10px] text-slate-500 pr-2">
                  {Math.round((currentMax / 4) * line)}
                </span>
                <div className="h-px flex-1 border-t border-dashed border-slate-800"></div>
              </div>
            ))}
          </div>

          {/* Data Bars */}
          <div className="absolute inset-0 left-8 flex items-end justify-between px-4 pb-0 pt-2">
            {consumptionData.map((data, idx) => {
              const value = activeChartToggle === 'Water' ? data.water : data.electricity;
              const heightPercent = (value / currentMax) * 100;
              const barColor =
                activeChartToggle === 'Water'
                  ? 'bg-gradient-to-t from-cyan-600/50 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'bg-gradient-to-t from-emerald-600/50 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]';

              return (
                <div key={idx} className="group relative flex h-full w-8 flex-col justify-end items-center sm:w-12">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 scale-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
                    {value} {activeChartToggle === 'Water' ? 'L' : 'kWh'}
                  </div>
                  {/* The Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-700 ease-out ${barColor}`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-Axis Labels */}
        <div className="mt-2 ml-8 flex justify-between px-4">
          {consumptionData.map((data, idx) => (
            <div key={idx} className="w-8 text-center text-[10px] text-slate-500 sm:w-12">
              {data.date}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Bottom Left - AI Yield Projections */}
        <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md lg:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-purple-400" />
              AI Harvest Prediction
            </h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-400 shadow-neon">
              Confidence Score: 96%
            </span>
          </div>

          <div className="mt-2 flex-1 space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                <Leaf className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Active Crop</p>
                <p className="text-base font-semibold text-white">{activeProfile}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Growth Cycle</span>
                <span className="text-sm font-bold text-cyan-400">{currentCropData.growth}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-cyan-300 shadow-neon-cyan transition-all duration-1000 ease-out" 
                  style={{ width: `${currentCropData.growth}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 text-center transition-colors hover:bg-purple-500/10">
              <p className="text-xs font-medium uppercase tracking-wider text-purple-400/80">
                Estimated Yield
              </p>
              <p className="mt-1 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                {currentCropData.yield}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Right - System Anomaly Log */}
        <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-md lg:col-span-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-200">
              System Anomaly Log
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {anomalyLogs.map((log, index) => (
                <div 
                  key={index} 
                  className="relative pl-4 border-l-2 border-slate-700/50 pb-4 last:border-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-600 ring-4 ring-slate-900/30"></div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono font-medium tracking-widest text-slate-500">
                      [{log.time}]
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reason: <span className="text-amber-400/80">{log.reason}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950/40 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white">
            View Full Logs
          </button>
        </div>

      </div>
    </div>
  );
}
