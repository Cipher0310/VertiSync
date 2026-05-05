import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Server,
  HardDrive,
  Activity,
  Terminal as TerminalIcon,
  BatteryMedium,
  Wifi,
  Droplet,
  Thermometer,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Network,
  Fan,
  Power
} from 'lucide-react';

const TelemetryRing = ({ value, label, color, icon: Icon, subtext }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Background Ring */}
        <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="8"
            className="stroke-slate-800 fill-none"
          />
          {/* Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="8"
            className={`fill-none transition-all duration-1000 ease-out ${color}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Icon className="mb-1 h-5 w-5 text-slate-300" strokeWidth={1.5} />
          <span className="text-sm font-bold text-white">{value}%</span>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {subtext && <p className="mt-1 text-[10px] text-slate-500">{subtext}</p>}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  if (status === 'online') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 shadow-neon">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        Online
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 shadow-neon-amber">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
        Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 shadow-neon-red">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
      Offline
    </span>
  );
};

export default function HardwareDiagnostics() {
  const [logs, setLogs] = useState([
    '[SYS] Edge Node MK-IV Initialized',
    '[MQTT] Connecting to broker.vertisync.local...',
    '[MQTT] Connection Established. QoS 1',
    '[AI] Predictive Engine Core loaded: Model v2.4.1',
  ]);

  useEffect(() => {
    const mockMessages = [
      '[SENSOR] Rack A - Moisture sensor calibration verified.',
      '[WARN] Rack C - Nutrient pH drift detected (6.3 -> 6.5).',
      '[ACTUATOR] Main pump flow rate steady at 4.2 L/min.',
      '[NET] Keep-alive ping from Gateway 2: OK (12ms).',
      '[AI] Adjusting irrigation schedule for Rack B (+5 mins).',
      '[SYS] Routine garbage collection completed (14ms).',
    ];

    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, mockMessages[Math.floor(Math.random() * mockMessages.length)]];
        if (newLogs.length > 20) return newLogs.slice(newLogs.length - 20);
        return newLogs;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Hardware Diagnostics</h1>
        <p className="mt-1 text-sm text-slate-400">System infrastructure and edge node telemetry</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Edge Node Telemetry */}
        <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-neon-cyan">
                <Server className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-200">Edge Node Telemetry</h2>
                <p className="text-xs text-slate-500">VertiSync AI Core (Node-01)</p>
              </div>
            </div>
            <StatusBadge status="online" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 py-6">
              <TelemetryRing value={42} label="CPU Load" color="stroke-cyan-400" icon={Cpu} subtext="ARM Cortex-A76" />
            </div>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 py-6">
              <TelemetryRing value={78} label="GPU Load" color="stroke-emerald-400" icon={Activity} subtext="NPU active" />
            </div>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 py-6">
              <TelemetryRing value={65} label="Memory" color="stroke-purple-400" icon={HardDrive} subtext="5.2 GB / 8.0 GB" />
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 py-6 shadow-neon-amber">
               <Thermometer className="mb-2 h-8 w-8 text-amber-400" strokeWidth={1.5} />
               <span className="text-3xl font-bold text-amber-400">54°C</span>
               <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber-500">Core Temp</p>
               <p className="mt-1 text-[10px] text-amber-500/70">Fan: 2400 RPM</p>
            </div>
          </div>
        </section>

        {/* Network & Power Flow */}
        <section className="flex flex-col gap-4 lg:col-span-4">
          <div className="flex-1 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
            <h2 className="mb-4 text-sm font-medium text-slate-400 flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Topology
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Gateway Alpha</p>
                    <p className="text-[10px] text-slate-500">192.168.1.104</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400">9ms</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">Gateway Beta</p>
                    <p className="text-[10px] text-slate-500">192.168.1.105</p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400">14ms</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
            <h2 className="mb-3 text-sm font-medium text-slate-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Power Draw
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">1,240</span>
              <span className="mb-1 text-sm text-slate-500">W</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-neon-amber" />
            </div>
            <p className="mt-2 text-xs text-slate-500">45% of peak capacity (2800W max)</p>
          </div>
        </section>

        {/* Sensor Array Status Grid */}
        <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-8">
           <div className="mb-5">
             <h2 className="text-sm font-medium text-slate-200">Sensor Array Health</h2>
             <p className="text-xs text-slate-500">IoT endpoints and telemetry units</p>
           </div>
           
           <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Sensor Item */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4 transition hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-cyan-400">
                    <Droplet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Soil Moisture Probe 01</p>
                    <p className="text-xs text-slate-500">Rack A • Zone 1</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status="online" />
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <BatteryMedium className="h-3 w-3" /> 84%
                  </span>
                </div>
              </div>

              {/* Sensor Item */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4 transition hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-amber-400">
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Ambient Temp Sensor</p>
                    <p className="text-xs text-slate-500">Rack B • Zone 2</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status="warning" />
                  <span className="flex items-center gap-1 text-[10px] text-amber-500/80">
                    Requires Calibration
                  </span>
                </div>
              </div>

              {/* Sensor Item */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4 transition hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-purple-400">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Nutrient pH Meter</p>
                    <p className="text-xs text-slate-500">Reservoir Alpha</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status="online" />
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Power className="h-3 w-3" /> Mains
                  </span>
                </div>
              </div>

              {/* Sensor Item */}
              <div className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-4 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-red-400">
                    <Droplet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Soil Moisture Probe 02</p>
                    <p className="text-xs text-red-400">Rack A • Zone 2</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status="offline" />
                  <span className="flex items-center gap-1 text-[10px] text-red-500/80">
                    Connection Lost
                  </span>
                </div>
              </div>
           </div>
        </section>

        {/* Actuator & Mechanical Health */}
        <section className="flex flex-col rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-4">
          <div className="mb-5">
             <h2 className="text-sm font-medium text-slate-200">Mechanical Systems</h2>
             <p className="text-xs text-slate-500">Pumps, valves, & airflow</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-300">Main Irrigation Pump</span>
                </div>
                <span className="text-xs text-slate-400">Normal</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800">
                <div className="h-full w-[85%] rounded-full bg-emerald-400 shadow-neon" />
              </div>
              <p className="mt-1 text-right text-[10px] text-slate-500">420 hours to maint.</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fan className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">HVAC Circulation</span>
                </div>
                <span className="text-xs text-slate-400">Active</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800">
                <div className="h-full w-[100%] rounded-full bg-cyan-400 shadow-neon-cyan" />
              </div>
              <p className="mt-1 text-right text-[10px] text-slate-500">Continuous operation</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
               <div className="flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                 <div>
                   <p className="text-xs font-medium text-amber-400">Valve B Solenoid Sticky</p>
                   <p className="mt-1 text-[10px] text-amber-500/80">Response time degraded (450ms). Consider cleaning or replacement during next cycle.</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Live Terminal Logs */}
        <section className="col-span-1 flex h-64 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 p-0 shadow-xl lg:col-span-12">
          <div className="flex items-center border-b border-slate-800/80 bg-slate-900/60 px-4 py-2">
            <TerminalIcon className="mr-2 h-4 w-4 text-slate-500" />
            <span className="text-xs font-mono text-slate-400">syslog // vertisync-edge-01</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            <div className="flex flex-col gap-1">
              {logs.map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.includes('[WARN]')) colorClass = 'text-amber-400';
                if (log.includes('[SYS]')) colorClass = 'text-cyan-400';
                if (log.includes('[AI]')) colorClass = 'text-purple-400';
                
                return (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 text-slate-600">
                      {new Date().toISOString().split('T')[1].slice(0, 8)}
                    </span>
                    <span className={colorClass}>{log}</span>
                  </div>
                );
              })}
              {/* Fake typing cursor */}
              <div className="flex gap-3 mt-1">
                <span className="shrink-0 text-slate-600">
                  {new Date().toISOString().split('T')[1].slice(0, 8)}
                </span>
                <span className="h-3 w-2 animate-pulse bg-slate-500"></span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
