import React from 'react';
import { Thermometer, Droplets, FlaskConical, Wind } from 'lucide-react';
import HeroMetricCard from './HeroMetricCard';

export default function EnvironmentalOverview({ currentTemp, currentHumidity, currentPh }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white/40 dark:border-slate-800/80 dark:bg-slate-900/40 p-5 shadow-lg dark:shadow-none backdrop-blur-sm transition-colors lg:col-span-12 lg:col-start-1 lg:row-start-3">
            <h2 className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                Simulated Environmental Overview
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <HeroMetricCard
                    icon={Thermometer}
                    label="Ambient Temp"
                    value={`${currentTemp.toFixed(1)}°C`}
                    status="Optimal"
                    variant="purple"
                />
                <HeroMetricCard
                    icon={Droplets}
                    label="Air Humidity"
                    value={`${currentHumidity.toFixed(1)}%`}
                    status="Monitoring"
                    variant="cyan"
                />
                <HeroMetricCard
                    icon={FlaskConical}
                    label="Nutrient pH"
                    value={currentPh.toFixed(1)}
                    status="Balanced"
                    variant="emerald"
                />
                <HeroMetricCard
                    icon={Wind}
                    label="Airflow Speed"
                    value="2.4 m/s"
                    status="Active"
                    variant="amber"
                />
            </div>
        </section>
    );
}
