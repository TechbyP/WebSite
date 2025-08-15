import { motion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  className?: string;
  once?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const FadeInWhenVisible = forwardRef<HTMLDivElement, FadeInWhenVisibleProps>(
  (
    {
      children,
      delay = 0,
      duration = 0.5,
      yOffset = 20,
      xOffset = 0,
      className = '',
      once = true,
      as = 'div'
    },
    ref
  ) => {
    const MotionComponent = motion[as] || motion.div;

    return (
      <MotionComponent
        ref={ref}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-50px 0px -50px 0px' }}
        transition={{
          duration,
          delay,
          ease: [0.2, 0.65, 0.3, 0.9]
        }}
        variants={{
          visible: { 
            opacity: 1, 
            y: 0,
            x: 0
          },
          hidden: { 
            opacity: 0, 
            y: yOffset,
            x: xOffset
          }
        }}
      >
        {children}
      </MotionComponent>
    );
  }
);

FadeInWhenVisible.displayName = 'FadeInWhenVisible';