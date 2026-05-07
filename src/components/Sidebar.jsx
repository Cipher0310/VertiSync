import {
  BarChart3,
  Cpu,
  Database,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'hardware', label: 'Hardware Diagnostics', icon: Cpu },
  { id: 'plants', label: 'Plant Database', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose, currentView, onNavigate }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(280px,85vw)] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white/95 dark:border-slate-800/80 dark:bg-slate-900/95 shadow-xl backdrop-blur-md transition-transform duration-200 ease-out md:static md:z-0 md:w-72 md:translate-x-0 md:border-r md:bg-white/50 dark:md:bg-slate-900/50 md:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 dark:border-slate-800/80 px-4 md:hidden">
          <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-lg font-bold text-transparent">
            VertiSync
          </span>
        </div>

        <nav className="flex-1 space-y-2 p-4 md:pt-6">
          {nav.map((item) => {
            const Icon = item.icon;

            // 2. Check if THIS item is the current view
            const active = currentView === item.id;

            return (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // 3. Navigate when clicked!
                      if (onNavigate) onNavigate(item.id);
                      onClose();
                    }}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                        active
                            ? 'border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-neon'
                            : 'border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <Icon className="h-6 w-6 shrink-0 opacity-90" strokeWidth={1.75} />
                  {item.label}
                </a>
            );
          })}
        </nav>

        <div className="mt-auto p-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 p-3 transition-colors">
            <p className="text-xs font-medium text-slate-500">System Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-neon" />
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">MQTT Connection: Live</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
