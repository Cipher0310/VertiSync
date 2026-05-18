import { useState, useEffect, useRef } from 'react';
import {
    Droplets,
    Fan,
    Lightbulb,
    Sparkles,
    Thermometer,
    Droplet,
    SunMedium,
    CloudLightning,
    Bot
} from 'lucide-react';
import { database } from './firebase.js';
import { ref, onValue } from 'firebase/database';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import HeroMetricCard from './components/HeroMetricCard.jsx';
import { plantProfiles } from './data/plantProfile.js';

import PlantDatabase from './components/plantDatabase.jsx';
import HardwareDiagnostics from './components/HardwareDiagnostics.jsx';
import Analytics from './components/Analytics.jsx';
import Settings from './components/setting.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import WeatherWidget from './components/WeatherWidget.jsx';
import HydrationMatrix from './components/HydrationMatrix.jsx';
import PredictiveEngine from './components/PredictiveEngine.jsx';
import CommandCenter from './components/CommandCenter.jsx';
import EnvironmentalOverview from './components/EnvironmentalOverview.jsx';

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');

    const [globalActiveProfile, setGlobalActiveProfile] = useState(() => {
        const savedProfile = localStorage.getItem('vertiSync_activeProfile');
        return savedProfile ? savedProfile : 'Malaysian Bok Choy';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vertiSync_theme') || 'dark';
    });

    const [availableSensors, setAvailableSensors] = useState(() => {
        const saved = localStorage.getItem('vertiSync_sensors');
        return saved ? JSON.parse(saved) : ['Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4'];
    });
    
    const [activeSensor, setActiveSensor] = useState('Sensor 1');

    useEffect(() => {
        localStorage.setItem('vertiSync_activeProfile', globalActiveProfile);
        setActiveSensor('Sensor 1'); // Reset to Sensor 1 when profile changes
    }, [globalActiveProfile]);

    useEffect(() => {
        localStorage.setItem('vertiSync_sensors', JSON.stringify(availableSensors));
    }, [availableSensors]);

    useEffect(() => {
        localStorage.setItem('vertiSync_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const [irrigation, setIrrigation] = useState(true);
    const [fans, setFans] = useState(false);
    const [lights, setLights] = useState(true);

    const [currentMoisture, setCurrentMoisture] = useState(38);
    const [isPumpActive, setIsPumpActive] = useState(false);
    const [healthAnalysisStatus, setHealthAnalysisStatus] = useState('idle');
    const [healthResult, setHealthResult] = useState({ score: 0, status: '', details: [], badgeClass: '', boxClass: '' });

    const [moistureHistory, setMoistureHistory] = useState(() => Array(30).fill(38));
    const [currentTemp, setCurrentTemp] = useState(24);
    const [tempHistory, setTempHistory] = useState(() => Array(30).fill(24));
    const [currentHumidity, setCurrentHumidity] = useState(65);

    // AI Prediction States
    const [evaporationRate, setEvaporationRate] = useState(0.28);
    const [timeToDryness, setTimeToDryness] = useState('2h 15m');
    const [currentPh, setCurrentPh] = useState(6.2);
    const [autopilot, setAutopilot] = useState(false);

    const currentMoistureRef = useRef(currentMoisture);
    const currentTempRef = useRef(currentTemp);
    useEffect(() => {
        currentMoistureRef.current = currentMoisture;
        currentTempRef.current = currentTemp;
    }, [currentMoisture, currentTemp]);

    useEffect(() => {
        const historyTimer = setInterval(() => {
            setMoistureHistory((prev) => [...prev.slice(1), currentMoistureRef.current]);
            setTempHistory((prev) => [...prev.slice(1), currentTempRef.current]);
        }, 1000);
        return () => clearInterval(historyTimer);
    }, []);

    useEffect(() => {
        const moistureRef = ref(database, 'sensor_readings/soil_moisture');
        const tempRef = ref(database, 'sensor_readings/temperature');
        const humidityRef = ref(database, 'sensor_readings/humidity');
        const phRef = ref(database, 'sensor_readings/ph');

        const unsubscribeMoisture = onValue(moistureRef, (snapshot) => {
            const liveMoisture = snapshot.val();
            if (liveMoisture !== null) {
                setCurrentMoisture(liveMoisture);
            }
        });

        const unsubscribeTemp = onValue(tempRef, (snapshot) => {
            const liveTemp = snapshot.val();
            if (liveTemp !== null) {
                setCurrentTemp(liveTemp);
            }
        });

        const unsubscribeHumidity = onValue(humidityRef, (snapshot) => {
            const liveHumidity = snapshot.val();
            if (liveHumidity !== null) {
                setCurrentHumidity(liveHumidity);
            }
        });

        const unsubscribePh = onValue(phRef, (snapshot) => {
            const livePh = snapshot.val();
            if (livePh !== null) {
                setCurrentPh(livePh);
            }
        });

        return () => {
            unsubscribeMoisture();
            unsubscribeTemp();
            unsubscribeHumidity();
            unsubscribePh();
        };
    }, []);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('vertiSync_auth') === 'true';
    });

    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const lat = 3.1390;
                const lon = 101.6869;
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
                
                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                setWeatherData(data);
                setWeatherLoading(false);
            } catch (err) {
                console.error("Error fetching weather data:", err);
                setWeatherError("Failed to load weather data.");
                setWeatherLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate AI Predictive Dryness
    useEffect(() => {
        // Basic AI heuristic model for evaporation
        const currentHour = new Date().getHours();
        const isDaytime = currentHour >= 6 && currentHour <= 18;
        const timeFactor = isDaytime ? 1.2 : 0.8; // Evaporates faster during the day
        
        // Evaporation increases with temperature and decreases with humidity
        const tempFactor = Math.max(0.1, currentTemp / 25);
        const humidityFactor = Math.max(0.1, 50 / Math.max(1, currentHumidity));
        
        // Weather forecast factor
        let weatherFactor = 1.0;
        if (weatherData && weatherData.daily && weatherData.daily.temperature_2m_max) {
            const todayMaxTemp = weatherData.daily.temperature_2m_max[0];
            const todayPop = weatherData.daily.precipitation_probability_max[0];
            
            if (todayMaxTemp > 32) {
                weatherFactor += 0.3; // Heatwave increases evaporation
            } else if (todayMaxTemp < 20) {
                weatherFactor -= 0.2; // Cold day decreases evaporation
            }

            if (todayPop > 60) {
                weatherFactor -= 0.2; // High chance of rain reduces evaporation speed
            }
        }

        // Base rate ~ 0.2% per minute under nominal conditions (25C, 50% hum)
        const rawRate = 0.2 * tempFactor * humidityFactor * timeFactor * weatherFactor;
        const simulatedRate = Math.max(0.01, parseFloat(rawRate.toFixed(2)));
        
        setEvaporationRate(simulatedRate);
        
        const CRITICAL_DRYNESS_THRESHOLD = 20; // 20% moisture is considered critically dry
        const moistureDiff = currentMoisture - CRITICAL_DRYNESS_THRESHOLD;
        
        if (moistureDiff <= 0) {
            setTimeToDryness('Critically Dry');
        } else {
            const minutesToDry = moistureDiff / simulatedRate;
            const hours = Math.floor(minutesToDry / 60);
            const mins = Math.floor(minutesToDry % 60);
            
            if (hours > 72) {
                setTimeToDryness('> 3 Days');
            } else {
                setTimeToDryness(`${hours}h ${mins}m`);
            }
        }
    }, [currentTemp, currentHumidity, currentMoisture, weatherData]);

    // Automated Climate Overrides
    useEffect(() => {
        if (!autopilot || !weatherData || !weatherData.current_weather || !weatherData.daily) return;

        const currentCode = weatherData.current_weather.weathercode;
        const todayMaxTemp = weatherData.daily.temperature_2m_max[0];
        const todayPop = weatherData.daily.precipitation_probability_max[0];

        // Grow lights: turn on if overcast, foggy, raining, or snowing (codes > 2)
        if (currentCode > 2) {
            setLights(true);
        } else {
            setLights(false);
        }

        // Fans: turn on if it's hot today
        if (todayMaxTemp > 28 || currentTemp > 28) {
            setFans(true);
        } else {
            setFans(false);
        }

        // Irrigation: turn off loop if high chance of rain
        if (todayPop > 70) {
            setIrrigation(false);
        } else {
            setIrrigation(true);
        }
    }, [autopilot, weatherData, currentTemp]);

    // Auto Pump Logic
    useEffect(() => {
        if (autopilot) {
            if (currentMoisture < 30) {
                setIsPumpActive(true);
            } else {
                setIsPumpActive(false);
            }
        }
    }, [autopilot, currentMoisture]);

    // The simulated evaporation and pump timers have been removed 
    // since data is now arriving directly from the ESP32 via Firebase!

    const handlePumpStart = () => setIsPumpActive(true);
    const handlePumpEnd = () => setIsPumpActive(false);

    const handleRunHealthAnalysis = () => {
        setHealthAnalysisStatus('analyzing');
        
        setTimeout(() => {
            const savedCustom = JSON.parse(localStorage.getItem('vs_customPlants') || '[]');
            const allPlants = [...plantProfiles, ...savedCustom];
            const activeCrop = allPlants.find(p => p.name === globalActiveProfile) || allPlants[0];
            
            const tempMatch = activeCrop.tempRange ? activeCrop.tempRange.match(/(\d+)/g) : null;
            const targetMinTemp = tempMatch ? parseInt(tempMatch[0]) : 20;
            const targetMaxTemp = tempMatch ? parseInt(tempMatch[1]) : 25;
            
            const phMatch = activeCrop.phRange ? activeCrop.phRange.match(/(\d+\.\d+)/g) : null;
            const targetMinPh = phMatch && phMatch.length >= 2 ? parseFloat(phMatch[0]) : 5.5;
            const targetMaxPh = phMatch && phMatch.length >= 2 ? parseFloat(phMatch[1]) : 6.5;

            let score = 100;
            let details = [];

            // Temp Check
            if (currentTemp > targetMaxTemp) {
                score -= 15;
                details.push(`High Temp (${currentTemp.toFixed(1)}°C). Target: <${targetMaxTemp}°C.`);
            } else if (currentTemp < targetMinTemp) {
                score -= 15;
                details.push(`Low Temp (${currentTemp.toFixed(1)}°C). Target: >${targetMinTemp}°C.`);
            } else {
                details.push(`Temp optimal.`);
            }

            // Moisture Check
            if (currentMoisture < 30) {
                score -= 20;
                details.push(`Soil Dry (${currentMoisture}%). Needs irrigation.`);
            } else if (currentMoisture > 80) {
                score -= 10;
                details.push(`Soil very wet (${currentMoisture}%). Allow to drain.`);
            } else {
                details.push(`Moisture optimal.`);
            }

            // pH Check
            if (currentPh > targetMaxPh) {
                score -= 10;
                details.push(`High pH (${currentPh.toFixed(1)}). Target: <${targetMaxPh}.`);
            } else if (currentPh < targetMinPh) {
                score -= 10;
                details.push(`Low pH (${currentPh.toFixed(1)}). Target: >${targetMinPh}.`);
            } else {
                details.push(`pH optimal.`);
            }
            
            // Humidity Check (generic)
            if (currentHumidity < 40) {
                score -= 5;
                details.push(`Low humidity (${currentHumidity}%).`);
            } else if (currentHumidity > 80) {
                score -= 5;
                details.push(`High humidity (${currentHumidity}%).`);
            }

            let status = 'Excellent';
            let badgeClass = 'text-[#00FF66] border-[#00FF66] bg-[#00FF66]/10';
            let boxClass = 'border-[#00FF66]/50 bg-emerald-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(0,255,102,0.15)]';
            
            if (score < 60) {
                status = 'Critical';
                badgeClass = 'text-rose-500 border-rose-500 bg-rose-500/10';
                boxClass = 'border-rose-500/50 bg-rose-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
            } else if (score < 85) {
                status = 'Warning';
                badgeClass = 'text-amber-500 border-amber-500 bg-amber-500/10';
                boxClass = 'border-amber-500/50 bg-amber-50 dark:bg-slate-950/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            }

            setHealthResult({ score, status, details, badgeClass, boxClass });
            setHealthAnalysisStatus('complete');
        }, 2000);
    };

    const handleResetHealthAnalysis = () => {
        setHealthAnalysisStatus('idle');
    };

    const predictiveAlerts = [];
    let hasRealWeatherAlert = false;
    
    if (weatherData && weatherData.current_weather) {
        const code = weatherData.current_weather.weathercode;
        if (code >= 95) {
            predictiveAlerts.push("SEVERE THUNDERSTORM WARNING: Secure outdoor vents and check power backups.");
            hasRealWeatherAlert = true;
        }
        else if ([56, 57, 66, 67].includes(code)) {
            predictiveAlerts.push("FREEZING RAIN WARNING: Monitor heating systems closely.");
            hasRealWeatherAlert = true;
        }
        else if (code >= 71 && code <= 86) {
            predictiveAlerts.push("EXTREME COLD / SNOW WARNING: Ensure insulation and heating are optimal.");
            hasRealWeatherAlert = true;
        }
    }
    
    // Add mockup if no real extreme weather
    if (!hasRealWeatherAlert) {
        predictiveAlerts.push("MOCKUP: SEVERE THUNDERSTORM WARNING - Secure outdoor vents and check power backups.");
    }

    // Add dryness alerts
    if (currentMoisture <= 20) {
        predictiveAlerts.push(`REAL-TIME DRYNESS: Soil moisture dropped to ${currentMoisture}%. Auto-pump triggered.`);
    } else if (timeToDryness === 'Critically Dry') {
        predictiveAlerts.push("CRITICAL DRYNESS: Soil moisture is at dangerous levels. Immediate irrigation required.");
    } else if (timeToDryness.includes('h') && parseInt(timeToDryness.split('h')[0]) < 2) {
        predictiveAlerts.push(`PREDICTIVE DRYNESS WARNING: Soil will reach critical dryness in ${timeToDryness}.`);
    } else if (timeToDryness.includes('m') && !timeToDryness.includes('h')) {
        predictiveAlerts.push(`PREDICTIVE DRYNESS WARNING: Soil will reach critical dryness in ${timeToDryness}.`);
    }

    // Determine displayed values based on active sensor
    const displayMoisture = activeSensor === 'Sensor 1' ? currentMoisture : 0;
    const displayTemp = activeSensor === 'Sensor 1' ? currentTemp : 0;
    const displayHumidity = activeSensor === 'Sensor 1' ? currentHumidity : 0;
    const displayPh = activeSensor === 'Sensor 1' ? currentPh : 0;

    const displayMoistureHistory = activeSensor === 'Sensor 1' ? moistureHistory : Array(30).fill(0);
    const displayTempHistory = activeSensor === 'Sensor 1' ? tempHistory : Array(30).fill(0);

    return (
        <>
            {/* If the user is NOT authenticated, show the login screen */}
            {!isAuthenticated ? (
                <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />
            ) : (
                <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300">
                    {/* PASS THE ROUTING PROPS TO THE SIDEBAR */}
                    <Sidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        currentView={currentView}
                        onNavigate={setCurrentView}
                    />

                    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto md:pl-0">
                        <TopNav
                            onMenuClick={() => setSidebarOpen((o) => !o)}
                            sidebarOpen={sidebarOpen}
                            globalActiveProfile={globalActiveProfile}
                            setGlobalActiveProfile={setGlobalActiveProfile}
                            predictiveAlerts={predictiveAlerts}
                            availableSensors={availableSensors}
                            activeSensor={activeSensor}
                            setActiveSensor={setActiveSensor}
                        />

                        {/* Real-Time Critical Dryness Toast Alert */}
                        {displayMoisture <= 20 && activeSensor === 'Sensor 1' && (
                            <div className="fixed bottom-6 right-6 z-[100] flex animate-bounce items-center gap-4 rounded-2xl border border-rose-500 bg-rose-500/95 px-6 py-4 text-white shadow-[0_0_30px_rgba(244,63,94,0.4)] backdrop-blur-md">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                                    <Droplets className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold uppercase tracking-widest text-white">Critical Dryness Alert</h3>
                                    <p className="mt-1 text-sm font-medium text-white/90">
                                        Real-time soil moisture dropped to <span className="font-bold text-white">{displayMoisture}%</span>. Immediate irrigation required!
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="scroll-bento flex-1 px-4 pb-8 pt-4 md:px-6 md:pt-5">
                            <div className="mx-auto max-w-[1400px]">
                                {/* Desktop subheader: pump status */}
                                <div className="mb-4 hidden items-center justify-end md:flex">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none transition-colors">
                                        Water Pump:{' '}
                                        <span className="font-semibold text-amber-400 tabular-nums">
                                            STANDBY
                                        </span>
                                    </div>
                                </div>

                                {/* THE MAGIC SWITCH LOGIC */}
                                {currentView === 'dashboard' ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                            <HydrationMatrix 
                                                currentMoisture={displayMoisture} 
                                                moistureHistory={displayMoistureHistory} 
                                                currentTemp={displayTemp} 
                                                tempHistory={displayTempHistory} 
                                            />

                                            <PredictiveEngine 
                                                weatherData={weatherData}
                                                timeToDryness={timeToDryness}
                                                evaporationRate={evaporationRate}
                                                healthAnalysisStatus={healthAnalysisStatus}
                                                handleRunHealthAnalysis={handleRunHealthAnalysis}
                                                healthResult={healthResult}
                                                globalActiveProfile={globalActiveProfile}
                                                handleResetHealthAnalysis={handleResetHealthAnalysis}
                                            />

                                            <CommandCenter 
                                                autopilot={autopilot}
                                                setAutopilot={setAutopilot}
                                                irrigation={irrigation}
                                                setIrrigation={setIrrigation}
                                                fans={fans}
                                                setFans={setFans}
                                                lights={lights}
                                                setLights={setLights}
                                                isPumpActive={isPumpActive}
                                                handlePumpStart={handlePumpStart}
                                                handlePumpEnd={handlePumpEnd}
                                            />

                                            <EnvironmentalOverview 
                                                currentTemp={displayTemp}
                                                currentHumidity={displayHumidity}
                                                currentPh={displayPh}
                                            />


                                        {/* Weather Prediction */}
                                        <div className="lg:col-span-12 lg:col-start-1 lg:row-start-4">
                                            <WeatherWidget weatherData={weatherData} loading={weatherLoading} error={weatherError} />
                                        </div>
                                    </div>
                                    </>
                                ) : currentView === 'plants' ? (
                                    /* RENDER THE PLANT DATABASE WHEN SELECTED */
                                    <PlantDatabase 
                                        activeProfile={globalActiveProfile}
                                        setGlobalActiveProfile={setGlobalActiveProfile} 
                                        currentTemp={currentTemp} 
                                        currentPh={currentPh} 
                                    />
                                ) : currentView === 'hardware' ? (
                                    /* RENDER THE HARDWARE DIAGNOSTICS WHEN SELECTED */
                                    <HardwareDiagnostics />
                                ) : currentView === 'analytics' ? (
                                    /* RENDER THE ANALYTICS WHEN SELECTED */
                                    <Analytics activeProfile={globalActiveProfile} />
                                ) : currentView === 'settings' ? (
                                    /* RENDER THE SETTINGS WHEN SELECTED */
                                    <Settings 
                                        theme={theme} 
                                        setTheme={setTheme} 
                                        availableSensors={availableSensors}
                                        setAvailableSensors={setAvailableSensors}
                                    />
                                ) : (
                                    /* Fallback for other pages */
                                    <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
                                        <p className="text-lg text-slate-500">
                                            Module "{currentView}" is currently offline.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
