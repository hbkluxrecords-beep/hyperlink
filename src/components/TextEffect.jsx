import { motion } from 'motion/react';

/**
 * Premium text effects. Wrap any text to apply the selected animation.
 * Effects: none, glow, pulse, shimmer, glitch
 */
export default function TextEffect({ effect = 'none', accent = '#FF4D1F', children, className = '', style = {} }) {
  if (!effect || effect === 'none') {
    return <span className={className} style={style}>{children}</span>;
  }

  if (effect === 'glow') {
    return (
      <span
        className={className}
        style={{
          ...style,
          textShadow: `0 0 12px ${accent}aa, 0 0 24px ${accent}66, 0 0 40px ${accent}33`,
        }}
      >
        {children}
      </span>
    );
  }

  if (effect === 'pulse') {
    return (
      <motion.span
        className={className}
        animate={{
          textShadow: [
            `0 0 8px ${accent}80, 0 0 16px ${accent}40`,
            `0 0 20px ${accent}cc, 0 0 36px ${accent}80`,
            `0 0 8px ${accent}80, 0 0 16px ${accent}40`,
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={style}
      >
        {children}
      </motion.span>
    );
  }

  if (effect === 'shimmer') {
    return (
      <span
        className={className}
        style={{
          ...style,
          backgroundImage: `linear-gradient(110deg, ${style.color || '#F2EFE6'} 30%, ${accent} 50%, ${style.color || '#F2EFE6'} 70%)`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          animation: 'plinks-shimmer 3s linear infinite',
        }}
      >
        {children}
      </span>
    );
  }

  if (effect === 'glitch') {
    return (
      <span
        className={className}
        style={{
          ...style,
          position: 'relative',
          display: 'inline-block',
          animation: 'plinks-glitch 3s infinite',
          textShadow: `2px 0 #00fff9, -2px 0 ${accent}, 0 0 8px ${accent}40`,
        }}
      >
        {children}
      </span>
    );
  }

  return <span className={className} style={style}>{children}</span>;
}
