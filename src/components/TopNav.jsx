import { Bell, ChevronDown, Menu } from 'lucide-react';

export default function TopNav({ onMenuClick, sidebarOpen }) {
  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md md:px-6">
      <h1 className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-lg font-bold tracking-tight text-transparent md:text-xl">
        VertiSync
      </h1>

      <button
        type="button"
        className="hidden max-w-md flex-1 items-center justify-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 md:flex"
      >
        <span className="text-slate-500">Active Profile:</span>
        <span className="font-medium text-slate-100">Malaysian Bok Choy</span>
        <ChevronDown className="ml-1 h-4 w-4 text-slate-500" aria-hidden />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onMenuClick}
          className={`rounded-xl border p-2.5 md:hidden ${
            sidebarOpen
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-neon'
              : 'border-slate-800 bg-slate-900/60 text-slate-300'
          }`}
          aria-expanded={sidebarOpen}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
