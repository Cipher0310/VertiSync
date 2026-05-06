import { useState } from 'react';
import { Bell, ChevronDown, Menu, AlertTriangle, Droplet, CheckCircle2, Sprout } from 'lucide-react';
import { plantProfiles } from '../data/plantProfile.js';

export default function TopNav({ onMenuClick, sidebarOpen,globalActiveProfile, setGlobalActiveProfile }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const notifications = [
        {
            id: 1,
            title: 'Water Reservoir Low',
            time: '10m ago',
            desc: 'Estimated empty in 2 hours. Refill required.',
            icon: Droplet,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10'
        },
        {
            id: 2,
            title: 'pH Imbalance Detected',
            time: '1h ago',
            desc: 'Rack B pH exceeded 6.5. Auto-dosing pH Down.',
            icon: AlertTriangle,
            color: 'text-rose-400',
            bg: 'bg-rose-400/10'
        },
        {
            id: 3,
            title: 'Recipe Deployment',
            time: '3h ago',
            desc: 'System calibrated for ' + globalActiveProfile + '.',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        }
    ];

    return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md md:px-6">
      <h1 className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-lg font-bold tracking-tight text-transparent md:text-xl">
        VertiSync
      </h1>

        <div className="relative hidden max-w-md flex-1 md:flex justify-center">
            <button
                type="button"
                onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false); // Close the other menu if open
                }}
                className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                    showProfileMenu
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-neon'
                        : 'border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-600'
                }`}
            >
                <span className={showProfileMenu ? "text-emerald-500/70" : "text-slate-500"}>Active Profile:</span>
                <span className="font-medium">{globalActiveProfile}</span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} aria-hidden />
            </button>

            {/* Profile Dropdown Panel */}
            {showProfileMenu && (
                <div className="absolute top-full mt-2 w-72 rounded-2xl border border-slate-800/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                    <div className="mb-2 px-3 pt-2">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Edge Node Recipe</h3>
                    </div>

                    <div className="flex max-h-60 flex-col gap-1 overflow-y-auto pr-1">
                        {plantProfiles.map((crop) => (
                            <button
                                key={crop.id}
                                onClick={() => {
                                    setGlobalActiveProfile(crop.name);
                                    setShowProfileMenu(false);
                                }}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-left ${
                                    globalActiveProfile === crop.name
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                }`}
                            >
                                <Sprout className={`h-4 w-4 shrink-0 ${globalActiveProfile === crop.name ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <span className="truncate text-sm font-medium">{crop.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="flex items-center gap-2 relative">

            {/* BELL ICON WITH NOTIFICATION BADGE */}
            <button
                type="button"
                onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (unreadCount > 0) setUnreadCount(0); // Clear the red badge when opened
                }}
                className={`relative rounded-xl border p-2.5 transition ${
                    showNotifications
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-neon-cyan'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {/* Red Unread Indicator */}
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
              {unreadCount}
            </span>
                )}
            </button>

            {/* DROPDOWN PANEL */}
            {showNotifications && (
                <div className="absolute right-12 top-full mt-2 w-80 rounded-2xl border border-slate-800/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl sm:right-0">
                    <div className="mb-2 px-3 pt-2">
                        <h3 className="text-sm font-semibold text-slate-200">Predictive Alerts</h3>
                    </div>

                    <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
                        {notifications.map((note) => (
                            <div key={note.id} className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-800/50 cursor-pointer">
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800/60 ${note.bg}`}>
                                    <note.icon className={`h-4 w-4 ${note.color}`} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-200">{note.title}</p>
                                        <span className="text-[10px] text-slate-500">{note.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{note.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 border-t border-slate-800/80 px-2 pt-2">
                        <button className="w-full rounded-lg py-2 text-center text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/10 hover:text-cyan-300">
                            View Alert History
                        </button>
                    </div>
                </div>
            )}

            {/* MOBILE MENU TOGGLE */}
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