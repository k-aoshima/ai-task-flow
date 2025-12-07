import { useState, useRef, useEffect } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // スワイプと判定する最小距離（px）
}

/**
 * スワイプジェスチャーを検出するカスタムフック
 */
export const useSwipe = (options: UseSwipeOptions = {}) => {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = options;
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const distance = currentX.current - startX.current;
    setSwipeDistance(distance);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const distance = currentX.current - startX.current;

    if (Math.abs(distance) >= threshold) {
      if (distance < 0 && onSwipeLeft) {
        // 左にスワイプ
        onSwipeLeft();
      } else if (distance > 0 && onSwipeRight) {
        // 右にスワイプ
        onSwipeRight();
      }
    }

    // リセット
    setSwipeDistance(0);
    setIsSwiping(false);
    startX.current = 0;
    currentX.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = startX.current;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    currentX.current = e.clientX;
    const distance = currentX.current - startX.current;
    setSwipeDistance(distance);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;

    const distance = currentX.current - startX.current;

    if (Math.abs(distance) >= threshold) {
      if (distance < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (distance > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    setSwipeDistance(0);
    setIsSwiping(false);
    startX.current = 0;
    currentX.current = 0;
  };

  // マウスイベントのグローバルリスナー
  useEffect(() => {
    if (isSwiping) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        currentX.current = e.clientX;
        const distance = currentX.current - startX.current;
        setSwipeDistance(distance);
      };

      const handleGlobalMouseUp = () => {
        const distance = currentX.current - startX.current;
        if (Math.abs(distance) >= threshold) {
          if (distance < 0 && onSwipeLeft) {
            onSwipeLeft();
          } else if (distance > 0 && onSwipeRight) {
            onSwipeRight();
          }
        }
        setSwipeDistance(0);
        setIsSwiping(false);
        startX.current = 0;
        currentX.current = 0;
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight]);

  return {
    swipeDistance,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  };
};

