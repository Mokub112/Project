interface CircularScoreProps {
  score: number;
}

export default function CircularScore({ score }: CircularScoreProps) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (score / 10) * circ;

  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="#F97316" strokeWidth="5"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
        {score}
      </span>
    </div>
  );
}