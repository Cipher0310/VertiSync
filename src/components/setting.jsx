import React, { useState } from 'react';
import {
    Save, Bell, Server,
    Sparkles, AlertTriangle, CheckCircle2,
    User, LogOut
} from 'lucide-react';

// Reusable toggle switch component
function SettingsToggle({ label, description, isOn, onToggle }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/30 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700/80">
            <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={isOn}
                onClick={() => onToggle(!isOn)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-all ${
                    isOn
                        ? 'border-emerald-500/50 bg-emerald-500/20 shadow-neon'
                        : 'border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80'
                }`}
            >
        <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                isOn ? 'left-6 bg-emerald-400' : 'left-0.5'
            }`}
        />
            </button>
        </div>
    );
}

export default function Settings({ theme, setTheme, availableSensors, setAvailableSensors }) {

    const [userName, setUserName] = useState(() => localStorage.getItem('vertiSync_activeUserName') || 'Administrator');
    // --- 1. FUNCTIONAL STATE (Reading from LocalStorage on load) ---
    const [aiAutonomous, setAiAutonomous] = useState(() => JSON.parse(localStorage.getItem('vs_aiAuto') ?? 'true'));
    const [pushAlerts, setPushAlerts] = useState(() => JSON.parse(localStorage.getItem('vs_pushAlerts') ?? 'true'));
    const [smsAlerts, setSmsAlerts] = useState(() => JSON.parse(localStorage.getItem('vs_smsAlerts') ?? 'false'));
    const [autoUpdate, setAutoUpdate] = useState(() => JSON.parse(localStorage.getItem('vs_autoUpdate') ?? 'true'));

    const [brokerUrl, setBrokerUrl] = useState(() => localStorage.getItem('vs_brokerUrl') ?? 'mqtt://broker.vertisync.local:1883');
    const [telemetrySync, setTelemetrySync] = useState(() => localStorage.getItem('vs_syncRate') ?? '30 Seconds');
    const [qosLevel, setQosLevel] = useState(() => localStorage.getItem('vs_qos') ?? 'QoS 1 (At least once)');

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [predictiveHarvest, setPredictiveHarvest] = useState(() => JSON.parse(localStorage.getItem('vs_predictiveHarvest') ?? 'true'));
    const [emailDigest, setEmailDigest] = useState(() => JSON.parse(localStorage.getItem('vs_emailDigest') ?? 'true'));

    // --- 2. FUNCTIONAL SAVE LOGIC ---
    const handleSave = () => {
        setIsSaving(true);

        // Simulate network delay, then save everything to local storage
        setTimeout(() => {
            localStorage.setItem('vs_aiAuto', JSON.stringify(aiAutonomous));
            localStorage.setItem('vs_pushAlerts', JSON.stringify(pushAlerts));
            localStorage.setItem('vs_smsAlerts', JSON.stringify(smsAlerts));
            localStorage.setItem('vs_autoUpdate', JSON.stringify(autoUpdate));
            localStorage.setItem('vs_brokerUrl', brokerUrl);
            localStorage.setItem('vs_syncRate', telemetrySync);
            localStorage.setItem('vs_qos', qosLevel);
            localStorage.setItem('vs_predictiveHarvest', JSON.stringify(predictiveHarvest));
            localStorage.setItem('vs_emailDigest', JSON.stringify(emailDigest));

            setIsSaving(false);
            setShowSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1200);
    };

    const handleLogout = () => {
        // 1. Remove the authentication token from memory
        localStorage.removeItem('vertiSync_auth');
        // 2. Force a hard reload of the app.
        // Because the token is gone, App.jsx will automatically render the AuthScreen!
        window.location.reload();
    };

    // --- 3. FUNCTIONAL DANGER ZONE LOGIC ---
    const handleEmergencyHalt = () => {
        const confirmHalt = window.confirm("WARNING: This will wipe all system memory, active profiles, and settings. Are you sure you want to trigger an Emergency System Halt?");
        if (confirmHalt) {
            localStorage.clear(); // Wipes the entire app memory
            window.location.reload(); // Forces a hard reset of the browser
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-12">

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center relative">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">System Preferences</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage automation protocols, edge node configs, and alerts.</p>
                </div>

                <div className="flex items-center gap-4">
                    {showSuccess && (
                        <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
              <CheckCircle2 className="h-4 w-4" /> Config Saved!
            </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-neon transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isSaving ? (
                            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" /> Saving...</>
                        ) : (
                            <><Save className="h-4 w-4" /> Save Configuration</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* Left Column: AI & Notifications */}
                <div className="flex flex-col gap-6 lg:col-span-7">

                    {/* Sensor Management Block */}
                    <section className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-6 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                        <div className="mb-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-neon-cyan">
                                    <Server className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Sensor Management</h2>
                                    <p className="text-xs text-slate-500">Manage available hardware sensor nodes.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAvailableSensors([...availableSensors, `Sensor ${availableSensors.length + 1}`])}
                                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                                + Add Sensor
                            </button>
                        </div>

                        <div className="space-y-2">
                            {availableSensors.map((sensor, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/30 px-4 py-3">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sensor}</span>
                                    {sensor !== 'Sensor 1' && (
                                        <button
                                            onClick={() => setAvailableSensors(availableSensors.filter((s) => s !== sensor))}
                                            className="text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    {sensor === 'Sensor 1' && (
                                        <span className="text-xs font-medium text-slate-400">Primary (Cannot Remove)</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* AI & Automation Block */}
                    <section className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-6 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-neon-purple">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">AI Automation Protocols</h2>
                                <p className="text-xs text-slate-500">Control how VertiSync's AI manages your hardware.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SettingsToggle
                                label="Autonomous AI Corrections"
                                description="Allow the AI to automatically adjust pH and fan speeds without manual approval."
                                isOn={aiAutonomous}
                                onToggle={setAiAutonomous}
                            />
                            <SettingsToggle
                                label="Predictive Harvest Scheduling"
                                description="Automatically shift nutrient profiles to 'Flush' 7 days before estimated harvest."
                                isOn={predictiveHarvest}
                                onToggle={setPredictiveHarvest}
                            />
                            <SettingsToggle
                                label="Edge Node Auto-Updates"
                                description="Silently push over-the-air (OTA) firmware updates to connected microcontrollers."
                                isOn={autoUpdate}
                                onToggle={setAutoUpdate}
                            />
                        </div>
                    </section>

                    {/* Alert Routing Block */}
                    <section className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-6 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 shadow-neon-amber">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Alert Routing</h2>
                                <p className="text-xs text-slate-500">Manage where critical system anomalies are sent.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SettingsToggle
                                label="Dashboard Push Notifications"
                                description="Show alerts in the Top Navigation bell icon."
                                isOn={pushAlerts}
                                onToggle={setPushAlerts}
                            />
                            <SettingsToggle
                                label="SMS Critical Alerts"
                                description="Send a text message if water reservoir drops below 10%."
                                isOn={smsAlerts}
                                onToggle={setSmsAlerts}
                            />
                            <SettingsToggle
                                label="Daily Email Digest"
                                description="Receive a 24-hour summary of resource consumption and AI actions."
                                isOn={emailDigest}
                                onToggle={setEmailDigest}
                            />
                        </div>
                    </section>

                </div>

                {/* Right Column: Technical & Danger Zone */}
                <div className="flex flex-col gap-6 lg:col-span-5">

                    {/* Account & Security Block */}
                    <section className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-6 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                {/* NEW: Showing the user's name here! */}
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Account: <span className="text-indigo-600 dark:text-indigo-400">{userName}</span></h2>
                                <p className="text-xs text-slate-500">Manage your active VertiSync session.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SettingsToggle
                                label="Light Mode"
                                description="Toggle the dashboard appearance between Light and Dark mode."
                                isOn={theme === 'light'}
                                onToggle={(isOn) => setTheme(isOn ? 'light' : 'dark')}
                            />

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all hover:border-slate-400 hover:bg-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white mt-4"
                            >
                                <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                Secure Log Out
                            </button>
                        </div>
                    </section>

                    {/* Edge Connection Block */}
                    <section className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-6 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-neon-cyan">
                                <Server className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">IoT Edge Connection</h2>
                                <p className="text-xs text-slate-500">MQTT broker and hardware parameters.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">MQTT Broker URL</label>
                                <input
                                    type="text"
                                    value={brokerUrl}
                                    onChange={(e) => setBrokerUrl(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-4 py-2.5 text-sm font-mono text-cyan-600 dark:text-cyan-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Telemetry Sync</label>
                                    <select
                                        value={telemetrySync}
                                        onChange={(e) => setTelemetrySync(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
                                    >
                                        <option value="5 Seconds">5 Seconds</option>
                                        <option value="30 Seconds">30 Seconds</option>
                                        <option value="1 Minute">1 Minute</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">QoS Level</label>
                                    <select
                                        value={qosLevel}
                                        onChange={(e) => setQosLevel(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
                                    >
                                        <option value="QoS 0">QoS 0 (At most once)</option>
                                        <option value="QoS 1">QoS 1 (At least once)</option>
                                        <option value="QoS 2">QoS 2 (Exactly once)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="rounded-3xl border border-red-500/20 bg-red-50 dark:bg-red-500/5 p-6 backdrop-blur-sm transition-colors">
                        <div className="mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Danger Zone</h2>
                        </div>

                        <p className="mb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            These actions affect live hardware and cannot be easily undone. Disconnecting the AI core will halt all automated irrigation.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => alert("Reboot signal sent to all edge nodes.")}
                                className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/50 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                Reboot All Edge Nodes
                            </button>
                            <button
                                onClick={handleEmergencyHalt}
                                className="w-full rounded-xl border border-red-500/50 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            >
                                Emergency System Halt
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}