import { useState, useEffect } from 'react';

/**
 * 打字机动画组件
 * @param {string} text - 要显示的文本
 * @param {number} speed - 打字速度（毫秒/字符）
 * @param {number} delay - 延迟开始时间（毫秒）
 */
export default function TypeWriter({ text, speed = 100, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    let currentIndex = 0;
    let timeoutId;

    const startTyping = () => {
      timeoutId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(timeoutId);
          setIsComplete(true);
        }
      }, speed);
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(timeoutId);
    };
  }, [text, speed, delay]);

  return (
    <span className="typewriter">
      {displayText}
      {!isComplete && <span className="cursor">|</span>}
    </span>
  );
}
