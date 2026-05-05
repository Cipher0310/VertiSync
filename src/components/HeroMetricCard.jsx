const glowByVariant = {
  purple: 'from-violet-500/30 to-fuchsia-500/10 shadow-[0_0_20px_rgba(167,139,250,0.25)]',
  teal: 'from-cyan-500/30 to-emerald-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]',
  yellow: 'from-amber-400/30 to-yellow-500/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]',
  lime: 'from-lime-400/25 to-emerald-500/10 shadow-[0_0_18px_rgba(163,230,53,0.2)]',
};

/**
 * Compact metric tile for environmental / overview rows.
 */
export default function HeroMetricCard({
  icon: Icon,
  label,
  value,
  status,
  statusClassName = 'text-emerald-400',
  variant = 'teal',
}) {
  const glow = glowByVariant[variant] ?? glowByVariant.teal;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 md:p-5 text-center backdrop-blur-sm">
      <div
        className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${glow} border border-slate-700/50`}
      >
        {Icon ? <Icon className="h-7 w-7 text-white" strokeWidth={1.75} /> : null}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white md:text-2xl">{value}</p>
      <p className={`mt-2 text-xs font-medium ${statusClassName}`}>{status}</p>
    </div>
  );
}
