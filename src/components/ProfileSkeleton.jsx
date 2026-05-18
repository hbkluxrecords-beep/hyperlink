import { motion } from 'motion/react';

const BG = '#0A0A0A';

function Bar({ width = '100%', height = 14, className = '', delay = 0 }) {
  return (
    <motion.div
      animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', delay }}
      className={className}
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        borderRadius: 2,
      }}
    />
  );
}

export default function ProfileSkeleton({ variant = 'creator' }) {
  return (
    <div style={{ background: BG, minHeight: '100vh' }} className="pb-20">
      <div className="max-w-xl mx-auto px-6 pt-10 pb-8">
        {/* tiny tag */}
        <Bar width={120} height={10} className="mb-3" />
        {/* big name */}
        <Bar width="70%" height={48} className="mb-3" delay={0.1} />
        {/* category line */}
        <Bar width="40%" height={10} className="mb-6" delay={0.15} />
        {/* bio block */}
        <div className="space-y-2 mb-8 p-3" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
          <Bar width="95%" height={12} delay={0.2} />
          <Bar width="88%" height={12} delay={0.22} />
          <Bar width="60%" height={12} delay={0.24} />
        </div>
        {/* buttons row */}
        <div className="flex gap-2 mb-8">
          <Bar width={80} height={32} delay={0.28} />
          <Bar width={80} height={32} delay={0.3} />
          <Bar width={80} height={32} delay={0.32} />
        </div>
        {/* pinned card */}
        <Bar width="100%" height={56} className="mb-6" delay={0.35} />
        {/* link cards */}
        <div className="space-y-2.5">
          <Bar width="100%" height={56} delay={0.38} />
          <Bar width="100%" height={56} delay={0.4} />
          <Bar width="100%" height={56} delay={0.42} />
          <Bar width="100%" height={56} delay={0.44} />
        </div>
      </div>
    </div>
  );
}
