import { useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { TimerData, Task, RemainingTime } from '../types';

/**
 * タイマー管理のカスタムフック（複数タイマー対応）
 */
export const useTimer = () => {
  const [timersData, setTimersData] = useLocalStorage<TimerData[]>(
    'aiTaskFlow_timersData',
    []
  );
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // タイマーインターバルの開始
  const startTimerInterval = useCallback(
    (timers: TimerData[]) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const expiredTimers: TimerData[] = [];
        const activeTimers = timers.filter((timer) => {
          if (timer.endTime <= now) {
            expiredTimers.push(timer);
            return false;
          }
          return true;
        });

        // 期限切れのタイマーがあれば通知
        expiredTimers.forEach((timer) => {
          alert(`タスク「${timer.originalTask.name}」の保留時間が終了しました。`);
        });

        if (expiredTimers.length > 0) {
          setTimersData(activeTimers);
        } else {
          // 再レンダリングをトリガー
          setTimersData((prev) => [...prev]);
        }
      }, 1000);
    },
    [setTimersData]
  );

  // タイマーの開始
  const startTimer = (task: Task, customMinutes?: number) => {
    const minutes = customMinutes ?? task.estimatedTime;
    const duration = minutes * 60 * 1000; // 分をミリ秒に変換
    const endTime = Date.now() + duration;
    const newTimerData: TimerData = {
      taskId: task.id,
      endTime,
      duration,
      originalTask: task,
    };

    setTimersData((prev) => [...prev, newTimerData]);
  };

  // 特定のタイマーをキャンセル
  const cancelTimer = (taskId: string) => {
    setTimersData((prev) => prev.filter((timer) => timer.taskId !== taskId));
  };

  // すべてのタイマーをキャンセル
  const cancelAllTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimersData([]);
  };

  // 特定のタスクの残り時間を計算
  const getRemainingTime = (taskId: string): RemainingTime => {
    const timer = timersData.find((t) => t.taskId === taskId);
    if (!timer || !timer.endTime) {
      return { minutes: 0, seconds: 0, progress: 0 };
    }
    const now = Date.now();
    const remaining = Math.max(0, timer.endTime - now);
    const total = timer.duration;
    const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return { minutes, seconds, progress };
  };

  // すべてのタイマーの残り時間を計算
  const getAllRemainingTimes = (): Map<string, RemainingTime> => {
    const result = new Map<string, RemainingTime>();
    timersData.forEach((timer) => {
      result.set(timer.taskId, getRemainingTime(timer.taskId));
    });
    return result;
  };

  // コンポーネントマウント時にタイマーを再開
  useEffect(() => {
    if (timersData.length > 0) {
      const activeTimers = timersData.filter((timer) => timer.endTime > Date.now());
      if (activeTimers.length > 0) {
        startTimerInterval(activeTimers);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timersData, startTimerInterval]);

  return {
    timersData,
    startTimer,
    cancelTimer,
    cancelAllTimers,
    getRemainingTime,
    getAllRemainingTimes,
  };
};

