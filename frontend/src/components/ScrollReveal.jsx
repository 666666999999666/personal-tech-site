import { useScrollAnimation } from '../hooks/useScrollAnimation.js';

/**
 * 滚动显示动画组件
 * 元素进入视口时淡入上浮
 */
export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
