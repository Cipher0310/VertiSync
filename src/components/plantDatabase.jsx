import { useState, useEffect } from 'react';
import {
    Thermometer, Droplet, SunMedium, Sparkles, Sprout,
    Play, Loader2, Activity, RefreshCw, Bug, FlaskConical,
    Search, ArrowUpDown, ChevronDown, Cpu, CheckCircle2,
    Calculator, Zap, Leaf, Plus, X, Edit, Trash2, Image as ImageIcon
} from 'lucide-react';

// Import the default static database
import { plantProfiles } from '../data/plantProfile.js';

const findPlantByName = (plants, profileName) => {
    if (!plants?.length) return null;
    if (profileName) {
        const match = plants.find((p) => p.name === profileName);
        if (match) return match;
    }
    return plants[0];
};

export default function PlantDatabase({ activeProfile, setGlobalActiveProfile, currentTemp = 24.0, currentPh = 6.2 }) {
    // --- 1. DYNAMIC DATA STATE ---
    const [customPlants, setCustomPlants] = useState(() => {
        const saved = localStorage.getItem('vs_customPlants');
        return saved ? JSON.parse(saved) : [];
    });

    const allPlants = [...plantProfiles, ...customPlants];

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');

    const hasData = Array.isArray(allPlants) && allPlants.length > 0;
    const [activeCrop, setActiveCrop] = useState(() => {
        const saved = localStorage.getItem('vs_customPlants');
        const custom = saved ? JSON.parse(saved) : [];
        const plants = [...plantProfiles, ...custom];
        return findPlantByName(plants, activeProfile);
    });

    useEffect(() => {
        if (!activeProfile || !allPlants.length) return;
        const match = allPlants.find((p) => p.name === activeProfile);
        if (match) {
            setActiveCrop((prev) => (prev?.id === match.id ? prev : match));
        }
    }, [activeProfile, customPlants]);

    const liveEnv = { temp: currentTemp, ph: currentPh };

    const [aiStatus, setAiStatus] = useState('standby');
    const [aiResult, setAiResult] = useState({ days: 0, advice: "" });
    const [deployStatus, setDeployStatus] = useState('idle');

    const [farmSize, setFarmSize] = useState(50);

    // --- 2. ADMIN & MODAL STATE ---
    const currentUserName = localStorage.getItem('vertiSync_activeUserName');
    const isAdmin = currentUserName === 'Judge' || currentUserName === 'Administrator';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // EXPANDED: Now handles every single data point in your database
    const defaultCropState = {
        name: '',
        imageUrl: '',
        tempRange: '20°C - 25°C',
        phRange: '5.5 - 6.5',
        lightCycle: '16 Hours ON',
        stage: 'Seedling',
        estimatedHarvestDays: 30,
        difficulty: 'Beginner',
        topThreat: 'Aphids',
        npkRatio: { n: 40, p: 20, k: 40 }
    };

    const [newCrop, setNewCrop] = useState(defaultCropState);

    useEffect(() => {
        setAiStatus('standby');
    }, [activeCrop, currentTemp, currentPh]);

    const runAiAnalysis = () => {
        setAiStatus('analyzing');

        setTimeout(() => {
            let dynamicAdvice = "";
            let adjustedDays = activeCrop.estimatedHarvestDays;

            const tempMatch = activeCrop.tempRange.match(/(\d+)/g);
            const targetMinTemp = tempMatch ? parseInt(tempMatch[0]) : 20;
            const targetMaxTemp = tempMatch ? parseInt(tempMatch[1]) : 25;

            const phMatch = activeCrop.phRange.match(/(\d+\.\d+)/g);
            const targetMaxPh = phMatch ? parseFloat(phMatch[1]) : 6.5;
            const targetMinPh = phMatch ? parseFloat(phMatch[0]) : 5.5;

            if (liveEnv.temp > targetMaxTemp) {
                dynamicAdvice += `⚠️ Heat stress risk (${liveEnv.temp.toFixed(1)}°C). Activating cooling fans. Reducing Nitrogen concentration. `;
                adjustedDays += 2;
            } else if (liveEnv.temp < targetMinTemp) {
                dynamicAdvice += `⚠️ Temp below optimal. Root absorption slowed. Delaying feed schedule. `;
                adjustedDays += 3;
            } else {
                dynamicAdvice += `✅ Temp is optimal. `;
            }

            if (liveEnv.ph > targetMaxPh) {
                dynamicAdvice += `Alkaline pH (${liveEnv.ph.toFixed(1)}) detected. Dispensing 5ml 'pH Down' into reservoir.`;
            } else if (liveEnv.ph < targetMinPh) {
                dynamicAdvice += `Acidic pH (${liveEnv.ph.toFixed(1)}) detected. Dispensing 'pH Up' to prevent nutrient lockout.`;
            } else {
                dynamicAdvice += `Proceeding with standard feed schedule.`;
            }

            setAiResult({ days: adjustedDays, advice: dynamicAdvice });
            setAiStatus('complete');
        }, 1500);
    };

    const handleDeployRecipe = () => {
        setDeployStatus('deploying');
        setTimeout(() => {
            setDeployStatus('success');
            setGlobalActiveProfile(activeCrop.name);
            setTimeout(() => setDeployStatus('idle'), 4000);
        }, 2000);
    };

    // --- 3. CRUD LOGIC ---
    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setNewCrop(defaultCropState);
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        setIsEditing(true);
        setEditId(activeCrop.id);
        setNewCrop({
            name: activeCrop.name,
            imageUrl: activeCrop.imageUrl || '',
            tempRange: activeCrop.tempRange,
            phRange: activeCrop.phRange,
            lightCycle: activeCrop.lightCycle,
            stage: activeCrop.stage || 'Seedling',
            estimatedHarvestDays: activeCrop.estimatedHarvestDays,
            difficulty: activeCrop.difficulty,
            topThreat: activeCrop.topThreat || '',
            npkRatio: activeCrop.npkRatio || { n: 40, p: 20, k: 40 }
        });
        setIsModalOpen(true);
    };

    const handleSaveCrop = (e) => {
        e.preventDefault();

        let updatedCustomPlants;

        if (isEditing) {
            updatedCustomPlants = customPlants.map(crop => {
                if (crop.id === editId) {
                    return { ...crop, ...newCrop, estimatedHarvestDays: Number(newCrop.estimatedHarvestDays) };
                }
                return crop;
            });
        } else {
            const newCropEntry = {
                id: `custom-${Date.now()}`,
                ...newCrop,
                estimatedHarvestDays: Number(newCrop.estimatedHarvestDays)
            };
            updatedCustomPlants = [...customPlants, newCropEntry];
        }

        setCustomPlants(updatedCustomPlants);
        localStorage.setItem('vs_customPlants', JSON.stringify(updatedCustomPlants));
        setActiveCrop(isEditing ? updatedCustomPlants.find(c => c.id === editId) : updatedCustomPlants[updatedCustomPlants.length - 1]);
        setIsModalOpen(false);
    };

    const handleDeleteCrop = () => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${activeCrop.name}" from the database?`);
        if (confirmDelete) {
            const updatedCustomPlants = customPlants.filter(crop => crop.id !== activeCrop.id);
            setCustomPlants(updatedCustomPlants);
            localStorage.setItem('vs_customPlants', JSON.stringify(updatedCustomPlants));
            setActiveCrop(plantProfiles[0]);
        }
    };

    if (!hasData || !activeCrop) return <div className="text-red-400 p-6">Data Connection Error.</div>;

    const getDifficultyColor = (level) => {
        if (level === 'Beginner') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        if (level === 'Intermediate') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    };

    const processedPlants = allPlants
        .filter(crop => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
            if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
            if (sortOption === 'harvest-asc') return a.estimatedHarvestDays - b.estimatedHarvestDays;
            if (sortOption === 'harvest-desc') return b.estimatedHarvestDays - a.estimatedHarvestDays;
            if (sortOption === 'difficulty') {
                const ranks = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
                return ranks[a.difficulty] - ranks[b.difficulty];
            }
            return 0;
        });

    const waterPerDayPerPlant = activeCrop.difficulty === 'Advanced' ? 0.8 : 0.4;
    const powerPerDayPerPlant = activeCrop.lightCycle.includes('18') || activeCrop.lightCycle.includes('16') ? 0.15 : 0.08;

    const totalWater = Math.round(farmSize * waterPerDayPerPlant * activeCrop.estimatedHarvestDays);
    const totalPower = Math.round(farmSize * powerPerDayPerPlant * activeCrop.estimatedHarvestDays);

    const isActiveCropCustom = activeCrop.id.toString().includes('custom');

    return (
        <div className="flex flex-col gap-6 lg:flex-row relative">

            {/* --- ADMIN FULL CRUD MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200/80 dark:bg-slate-950/80 backdrop-blur-sm px-4 py-6 transition-colors">
                    {/* Added max-h and overflow-y-auto so the tall form scrolls cleanly */}
                    <div className="w-full max-w-md rounded-3xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto scroll-bento transition-colors">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6 flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isEditing ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'}`}>
                                {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Custom Crop' : 'Add Custom Crop'}</h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Full Database Record Management</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveCrop} className="space-y-5">
                            {/* Basics */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Crop Name</label>
                                    <input required type="text" value={newCrop.name} onChange={(e) => setNewCrop({...newCrop, name: e.target.value})} placeholder="e.g. Heirloom Tomatoes" className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"><ImageIcon className="h-3 w-3"/> Image URL (Optional)</label>
                                    <input type="url" value={newCrop.imageUrl} onChange={(e) => setNewCrop({...newCrop, imageUrl: e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                </div>
                            </div>

                            {/* Environment Thresholds */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 p-4 space-y-4 transition-colors">
                                <h3 className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-500 font-bold">Environmental Targets</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Target Temp</label>
                                        <input required type="text" value={newCrop.tempRange} onChange={(e) => setNewCrop({...newCrop, tempRange: e.target.value})} placeholder="20°C - 25°C" className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Target pH</label>
                                        <input required type="text" value={newCrop.phRange} onChange={(e) => setNewCrop({...newCrop, phRange: e.target.value})} placeholder="5.5 - 6.5" className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Light Cycle</label>
                                    <input required type="text" value={newCrop.lightCycle} onChange={(e) => setNewCrop({...newCrop, lightCycle: e.target.value})} placeholder="16 Hours ON" className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                </div>
                            </div>

                            {/* Agronomy & Stats */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 p-4 space-y-4 transition-colors">
                                <h3 className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-500 font-bold">Agronomy Data</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Growth Stage</label>
                                        <select value={newCrop.stage} onChange={(e) => setNewCrop({...newCrop, stage: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none">
                                            <option>Seedling</option>
                                            <option>Vegetative</option>
                                            <option>Flowering</option>
                                            <option>Fruiting</option>
                                            <option>Harvest Ready</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Difficulty</label>
                                        <select value={newCrop.difficulty} onChange={(e) => setNewCrop({...newCrop, difficulty: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none">
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Harvest Days</label>
                                        <input required type="number" min="1" value={newCrop.estimatedHarvestDays} onChange={(e) => setNewCrop({...newCrop, estimatedHarvestDays: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"><Bug className="h-3 w-3"/> Top Threat</label>
                                        <input type="text" value={newCrop.topThreat} onChange={(e) => setNewCrop({...newCrop, topThreat: e.target.value})} placeholder="e.g. Aphids" className="mt-1 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                    </div>
                                </div>

                                {/* NPK Inputs */}
                                <div>
                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1"><FlaskConical className="h-3 w-3"/> N-P-K Ratio (%)</label>
                                    <div className="mt-1 flex gap-2">
                                        <div className="flex flex-col relative w-full">
                                            <span className="absolute top-2 left-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">N</span>
                                            <input type="number" min="0" max="100" value={newCrop.npkRatio.n} onChange={(e) => setNewCrop({...newCrop, npkRatio: {...newCrop.npkRatio, n: Number(e.target.value)}})} className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 pl-6 pr-2 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                        </div>
                                        <div className="flex flex-col relative w-full">
                                            <span className="absolute top-2 left-2 text-xs text-amber-500 dark:text-amber-400 font-bold">P</span>
                                            <input type="number" min="0" max="100" value={newCrop.npkRatio.p} onChange={(e) => setNewCrop({...newCrop, npkRatio: {...newCrop.npkRatio, p: Number(e.target.value)}})} className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 pl-6 pr-2 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                        </div>
                                        <div className="flex flex-col relative w-full">
                                            <span className="absolute top-2 left-2 text-xs text-violet-500 dark:text-violet-400 font-bold">K</span>
                                            <input type="number" min="0" max="100" value={newCrop.npkRatio.k} onChange={(e) => setNewCrop({...newCrop, npkRatio: {...newCrop.npkRatio, k: Number(e.target.value)}})} className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 pl-6 pr-2 py-2 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={`mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-slate-950 shadow-neon transition hover:brightness-110 ${isEditing ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}>
                                {isEditing ? 'Save Changes' : 'Create Crop Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- LEFT PANEL: Crop Library --- */}
            <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors lg:w-1/3">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Sprout className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Crop Library</h2>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Crop
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-3 mb-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search crops..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <ArrowUpDown className="h-4 w-4 text-slate-500" />
                        </div>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-slate-200 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        >
                            <option value="name-asc">Alphabetical (A - Z)</option>
                            <option value="name-desc">Alphabetical (Z - A)</option>
                            <option value="harvest-asc">Harvest: Fastest First</option>
                            <option value="harvest-desc">Harvest: Longest First</option>
                            <option value="difficulty">Difficulty: Easiest First</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto pr-1 scroll-bento" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                    {processedPlants.length > 0 ? (
                        processedPlants.map((crop) => {
                            const isActive = activeCrop.id === crop.id;
                            const isCustom = crop.id.toString().includes('custom');

                            return (
                                <button
                                    key={crop.id}
                                    onClick={() => setActiveCrop(crop)}
                                    className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all relative ${
                                        isActive
                                            ? 'border border-emerald-500/50 bg-gradient-to-r from-emerald-50 dark:from-emerald-500/20 to-cyan-50 dark:to-cyan-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-neon'
                                            : 'border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        {crop.imageUrl ? (
                                            <img
                                                src={crop.imageUrl}
                                                alt={crop.name}
                                                className={`h-8 w-8 shrink-0 rounded-full object-cover border-2 ${isActive ? 'border-emerald-500 dark:border-emerald-400' : 'border-slate-200 dark:border-slate-700'}`}
                                            />
                                        ) : (
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isActive ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'}`}>
                                                <Sprout className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div className="flex flex-col items-start truncate">
                                            <span className="truncate text-left">{crop.name}</span>
                                            {isCustom && <span className="text-[9px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mt-0.5">Custom</span>}
                                        </div>
                                    </div>

                                    {(sortOption === 'harvest-asc' || sortOption === 'harvest-desc') && (
                                        <span className="shrink-0 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md">
                                            {crop.estimatedHarvestDays} Days
                                        </span>
                                    )}
                                    {sortOption === 'difficulty' && (
                                        <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${getDifficultyColor(crop.difficulty)}`}>
                                            {crop.difficulty}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-sm text-slate-500">
                            No crops match your search.
                        </div>
                    )}
                </div>
            </section>

            {/* --- RIGHT PANEL: The Details --- */}
            <section className="flex flex-col gap-6 lg:w-2/3">

                {/* CARD 1: AGRONOMY & DEPLOYMENT */}
                <div className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm relative transition-colors">

                    {isAdmin && isActiveCropCustom && (
                        <div className="absolute top-5 right-5 flex items-center gap-2">
                            <button
                                onClick={openEditModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50"
                                title="Edit Crop"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleDeleteCrop}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/50"
                                title="Delete Crop"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-5 mb-6 border-b border-slate-200 dark:border-slate-800/80 pb-5 transition-colors">
                        {activeCrop.imageUrl ? (
                            <img
                                src={activeCrop.imageUrl}
                                alt={activeCrop.name}
                                className="h-20 w-20 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-700"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center shadow-md">
                                <Sprout className="h-8 w-8 text-emerald-500/50" />
                            </div>
                        )}
                        <div className="flex-1 pr-16">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeCrop.name}</h2>
                                {activeCrop.difficulty && (
                                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(activeCrop.difficulty)}`}>
                                        {activeCrop.difficulty}
                                    </span>
                                )}
                            </div>
                            <span className="text-slate-600 dark:text-slate-500 font-medium tracking-wide text-sm uppercase flex items-center gap-2 mt-1">
                                Agronomy & Target Thresholds
                                {isActiveCropCustom && <span className="text-[10px] bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/30 font-bold">CUSTOM ENTRY</span>}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/40 p-4 text-center transition-colors">
                            <Thermometer className="mb-2 h-6 w-6 text-violet-500 dark:text-violet-400" />
                            <p className="text-xs text-slate-500">Target Temp</p>
                            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-200">{activeCrop.tempRange}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/40 p-4 text-center transition-colors">
                            <Droplet className="mb-2 h-6 w-6 text-amber-500 dark:text-amber-400" />
                            <p className="text-xs text-slate-500">Target pH</p>
                            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-200">{activeCrop.phRange}</p>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/40 p-4 text-center transition-colors">
                            <SunMedium className="mb-2 h-6 w-6 text-lime-500 dark:text-lime-400" />
                            <p className="text-xs text-slate-500">Light Cycle</p>
                            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-200">{activeCrop.lightCycle}</p>
                        </div>
                    </div>

                    {activeCrop.topThreat && activeCrop.npkRatio && (
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 p-4 transition-colors">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400">
                                    <Bug className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">Top Bio-Threat</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-300">{activeCrop.topThreat}</p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/40 p-4 transition-colors">
                                <div className="mb-2 flex items-center gap-2">
                                    <FlaskConical className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Nutrient Ratio (N-P-K)</span>
                                </div>
                                {activeCrop.npkRatio.n === 0 && activeCrop.npkRatio.p === 0 ? (
                                    <p className="text-sm text-slate-500 italic">Relies on seed energy (Zero nutrients)</p>
                                ) : (
                                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                        <div style={{ width: `${activeCrop.npkRatio.n}%` }} className="bg-emerald-500 dark:bg-emerald-400" title="Nitrogen" />
                                        <div style={{ width: `${activeCrop.npkRatio.p}%` }} className="bg-amber-500 dark:bg-amber-400" title="Phosphorus" />
                                        <div style={{ width: `${activeCrop.npkRatio.k}%` }} className="bg-violet-500 dark:bg-violet-400" title="Potassium" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 border-t border-slate-800/80 pt-6">
                        <button
                            onClick={handleDeployRecipe}
                            disabled={deployStatus !== 'idle'}
                            className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-3.5 text-sm font-bold tracking-wide transition-all duration-300 ${
                                deployStatus === 'idle'
                                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-neon hover:scale-[1.01] hover:brightness-110'
                                    : deployStatus === 'deploying'
                                        ? 'border border-slate-700 bg-slate-800 text-slate-400'
                                        : 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                            }`}
                        >
                            {deployStatus === 'idle' && (
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}

                            {deployStatus === 'idle' && (
                                <><Cpu className="h-5 w-5" /> Deploy Recipe to Edge Node</>
                            )}
                            {deployStatus === 'deploying' && (
                                <><Loader2 className="h-5 w-5 animate-spin text-cyan-400" /> Syncing Parameters via MQTT...</>
                            )}
                            {deployStatus === 'success' && (
                                <><CheckCircle2 className="h-5 w-5" /> System Calibrated for {activeCrop.name}</>
                            )}
                        </button>
                        <p className="mt-2 text-center text-xs text-slate-500 italic">
                            Automatically adjusts physical environment to match target thresholds.
                        </p>
                    </div>
                </div>

                {/* CARD 2: INTERACTIVE AI PREDICTION ENGINE */}
                <div className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/35 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 shadow-sm dark:shadow-neon-cyan">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Dynamic AI Lifecycle Analysis</h2>
                        </div>

                        <button
                            onClick={runAiAnalysis}
                            disabled={aiStatus === 'analyzing'}
                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-neon-cyan transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {aiStatus === 'analyzing' ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                <><Play className="h-4 w-4 fill-current" /> Run AI Analysis</>
                            )}
                        </button>
                    </div>

                    <div className="mb-5 flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30 p-4 relative overflow-hidden transition-colors">
                        <div className="absolute top-2 right-3 flex items-center gap-2">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 dark:bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-500"></span>
                          </span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Sensor Feed</span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Current Temp</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono text-cyan-600 dark:text-cyan-400">{liveEnv.temp.toFixed(1)}°C</span>
                            </div>
                        </div>

                        <div className="w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

                        <div className="flex flex-1 flex-col justify-center">
                            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Current pH</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono text-emerald-600 dark:text-emerald-400">{liveEnv.ph.toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 my-auto ml-2" title="Real-time Sync Active">
                            <RefreshCw className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-[spin_3s_linear_infinite]" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 relative">
                        {aiStatus === 'standby' && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px]">
                                <p className="text-sm text-cyan-600 dark:text-cyan-400 tracking-widest uppercase font-medium animate-pulse">Awaiting Analysis</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950/40 p-5 transition-colors">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Growth Phase</p>
                                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{activeCrop.stage || 'Vegetative'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Adjusted Harvest</p>
                                <p className={`mt-1 text-2xl font-bold ${aiStatus === 'complete' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent' : 'text-slate-400 dark:text-slate-600'}`}>
                                    {aiStatus === 'complete' ? `${aiResult.days} Days` : '-- Days'}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-2xl border p-4 transition-all duration-500 ${
                            aiStatus === 'complete' ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40'
                        }`}>
                            <p className={`text-sm font-semibold mb-1 flex items-center gap-2 ${aiStatus === 'complete' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                System Action Executed:
                            </p>
                            <p className={aiStatus === 'complete' ? 'text-slate-800 dark:text-slate-200 leading-relaxed' : 'text-slate-500 dark:text-slate-600'}>
                                {aiStatus === 'complete' ? aiResult.advice : "Run analysis to cross-reference target thresholds with live sensor data..."}
                            </p>
                        </div>
                    </div>

                </div>

                {/* CARD 3: RESOURCE PREDICTOR */}
                <div className="rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Calculator className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Resource Consumption Predictor</h2>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold pl-2">Planting Slots:</span>
                            <input
                                type="number"
                                min="1"
                                max="10000"
                                value={farmSize}
                                onChange={(e) => setFarmSize(e.target.value)}
                                className="w-20 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-1 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col justify-center rounded-2xl border border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/5 p-4 transition-all hover:bg-cyan-100 dark:hover:bg-cyan-500/10">
                            <div className="mb-2 flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Est. Water / Cycle</span>
                            </div>
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                {totalWater.toLocaleString()} <span className="text-sm font-normal text-slate-500">Liters</span>
                            </p>
                        </div>

                        <div className="flex flex-col justify-center rounded-2xl border border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 transition-all hover:bg-amber-100 dark:hover:bg-amber-500/10">
                            <div className="mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Est. Power / Cycle</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                                {totalPower.toLocaleString()} <span className="text-sm font-normal text-slate-500">kWh</span>
                            </p>
                        </div>

                        <div className="flex flex-col justify-center rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-4 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <Leaf className="h-24 w-24 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <div className="mb-2 flex items-center gap-2 relative z-10">
                                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Sustainability</span>
                            </div>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 relative z-10">Saves 90% Water</p>
                            <p className="text-[10px] text-slate-500 relative z-10 uppercase tracking-widest mt-1">vs. traditional soil farming</p>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}