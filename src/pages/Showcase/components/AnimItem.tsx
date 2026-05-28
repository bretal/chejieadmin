import type { ReactNode } from 'react';
import { useInView } from '../hooks/useInView';
import type { AnimVariant } from './types';

type AnimItemProps = {
  variant?: AnimVariant;
  delay?: number;
  className?: string;
  children: ReactNode;
};

export default function AnimItem({
  variant = 'up',
  delay = 0,
  className = '',
  children,
}: AnimItemProps) {
  const { ref, inView } = useInView();
  const variantClass =
    variant === 'left' ? 'anim-left' : variant === 'right' ? 'anim-right' : variant === 'scale' ? 'anim-scale' : 'anim-item';
  const delayClass = delay > 0 ? `anim-d${delay}` : '';

  return (
    <div ref={ref} className={`${variantClass} ${delayClass} ${className} ${inView ? 'in-view' : ''}`}>
      {children}
    </div>
  );
}
