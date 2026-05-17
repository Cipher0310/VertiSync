import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudFog, CloudLightning, Snowflake, CloudDrizzle, MapPin, Loader2 } from 'lucide-react';

export default function WeatherWidget({ weatherData, loading, error }) {

    // Weather code mapping
    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun className="h-10 w-10 text-amber-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="h-10 w-10 text-slate-400" />;
        if (code === 45 || code === 48) return <CloudFog className="h-10 w-10 text-slate-400" />;
        if (code >= 51 && code <= 57) return <CloudDrizzle className="h-10 w-10 text-cyan-400" />;
        if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className="h-10 w-10 text-blue-400" />;
        if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <Snowflake className="h-10 w-10 text-cyan-200" />;
        if (code >= 95) return <CloudLightning className="h-10 w-10 text-purple-400" />;
        return <Cloud className="h-10 w-10 text-slate-400" />;
    };

    const getWeatherDescription = (code) => {
        if (code === 0) return 'Clear sky';
        if (code === 1) return 'Mainly clear';
        if (code === 2) return 'Partly cloudy';
        if (code === 3) return 'Overcast';
        if (code === 45 || code === 48) return 'Fog';
        if (code >= 51 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Rain showers';
        if (code >= 85 && code <= 86) return 'Snow showers';
        if (code >= 95) return 'Thunderstorm';
        return 'Unknown';
    };

    return (
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50 p-5 shadow-lg dark:shadow-xl backdrop-blur-sm transition-colors">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Kuala Lumpur Forecast
                </h2>
                <div className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
            </div>

            <div className="mt-4 flex-1">
                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : error ? (
                    <div className="flex h-32 items-center justify-center text-sm text-rose-500">
                        {error}
                    </div>
                ) : weatherData && weatherData.current_weather && weatherData.daily ? (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Current Weather */}
                        <div className="flex-1 rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-slate-50 to-cyan-50/50 dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950/40 p-6 shadow-sm dark:shadow-none transition-colors flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Condition</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 shadow-neon-cyan shrink-0">
                                        {getWeatherIcon(weatherData.current_weather.weathercode)}
                                    </div>
                                    <div>
                                        <p className="bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                                            {weatherData.current_weather.temperature}°C
                                        </p>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {getWeatherDescription(weatherData.current_weather.weathercode)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex flex-col items-end text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Wind Speed</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{weatherData.current_weather.windspeed} km/h</p>
                            </div>
                        </div>

                        {/* Forecast List */}
                        <div className="flex-1 flex flex-col justify-center gap-3">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">3-Day Prediction</p>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {weatherData.daily.time.slice(0, 3).map((time, index) => {
                                    const date = new Date(time);
                                    const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const maxTemp = weatherData.daily.temperature_2m_max[index];
                                    const minTemp = weatherData.daily.temperature_2m_min[index];
                                    const pop = weatherData.daily.precipitation_probability_max[index];
                                    
                                    return (
                                        <div key={time} className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/40 dark:border-slate-800/60 dark:bg-slate-950/40 p-3 transition-colors text-center hover:bg-slate-50 dark:hover:bg-slate-900/60">
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{dayName}</p>
                                            <div className="my-2 scale-75">
                                                {getWeatherIcon(weatherData.daily.weathercode[index])}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 w-full">
                                                <span className="text-xs font-bold text-slate-800 dark:text-white">{Math.round(maxTemp)}°</span>
                                                <span className="text-xs font-medium text-slate-400">{Math.round(minTemp)}°</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-blue-500 dark:text-blue-400">
                                                <CloudRain className="h-3 w-3" />
                                                {pop}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
