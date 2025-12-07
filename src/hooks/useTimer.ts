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
        let needsUpdate = false;
        
        const updatedTimers = timers.map((timer) => {
          // すでに期限切れフラグが立っている場合は何もしない
          if (timer.hasExpired) return timer;
          
          if (timer.endTime <= now) {
            // 新しく期限切れになった場合
            needsUpdate = true;
            return { ...timer, hasExpired: true };
          }
          return timer;
        });

        // 状態更新が必要な場合のみsetTimersDataを呼ぶ
        if (needsUpdate) {
            setTimersData(updatedTimers);
        } else {
             // force re-render for progress bars (if we want smooth UI updates for active timers)
             // State reference change triggers re-render
             // map creates shallow copy, so if active timers exist, we might want to update?
             // Actually, map logic above returns same reference if no change? 
             // No, standard map creates new array, but objects?
             // If we want to trigger re-render every second for countdown:
             setTimersData((prev) => [...prev]);
        }
      }, 1000);
    },
    [setTimersData]
  );


  // タイマーの開始
  const startTimer = (task: Task, customMinutes?: number) => {
    // デバッグモードの確認
    const debugMode = localStorage.getItem('aiTaskFlow_debugMode') === 'true';

    let duration: number;
    let minutes: number;

    if (debugMode) {
        minutes = 0.083; // approx 5 sec
        duration = 5000; // 5 seconds
    } else {
        minutes = customMinutes ?? task.estimatedTime;
        duration = minutes * 60 * 1000; // 分をミリ秒に変換
    }

    const endTime = Date.now() + duration;
    const newTimerData: TimerData = {
      taskId: task.id,
      endTime,
      duration,
      originalTask: task,
    };

    setTimersData((prev) => [...prev, newTimerData]);

    // Chromeアラームの設定
    if ((chrome as any)?.alarms) {
      // アラーム名にタスク情報を含める（バックグラウンドで名前を取得できるようにする）
      const alarmName = JSON.stringify({ taskId: task.id, taskName: task.name });
      (chrome as any).alarms.create(alarmName, {
        when: endTime
      });
    }
  };

  // 特定のタイマーをキャンセル
  const cancelTimer = (taskId: string) => {
    setTimersData((prev) => prev.filter((timer) => timer.taskId !== taskId));
    const timer = timersData.find((t) => t.taskId === taskId);
    if ((chrome as any)?.alarms && timer) {
      const alarmName = JSON.stringify({ taskId: timer.taskId, taskName: timer.originalTask.name });
      (chrome as any).alarms.clear(alarmName);
    }
  };

  // すべてのタイマーをキャンセル
  const cancelAllTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // 現在のタイマーのIDをすべて取得してキャンセル
    timersData.forEach(timer => {
      if ((chrome as any)?.alarms) {
        const alarmName = JSON.stringify({ taskId: timer.taskId, taskName: timer.originalTask.name });
        (chrome as any).alarms.clear(alarmName);
      }
    });

    setTimersData([]);
  };

  // 特定のタスクの残り時間を計算
  const getRemainingTime = (taskId: string): RemainingTime => {
    const timer = timersData.find((t) => t.taskId === taskId);
    if (!timer || !timer.endTime) {
      return { minutes: 0, seconds: 0, progress: 0 };
    }
    const now = Date.now();
    
    // 期限切れの場合
    if (timer.hasExpired || timer.endTime <= now) {
         return { minutes: 0, seconds: 0, progress: 100 };
    }

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

  // コンポーネントマウント時やデータ変更時にタイマーを評価
  useEffect(() => {
    if (timersData.length > 0) {
      const now = Date.now();
      const activeTimers: TimerData[] = [];
      const expiredTimers: TimerData[] = [];

      timersData.forEach(timer => {
        if (timer.endTime > now) {
          activeTimers.push(timer);
        } else {
          expiredTimers.push(timer);
        }
      });

      // 期限切れタイマーの即時処理
      // 以前のロジック: フロントエンド通知 -> 削除
      // 新しいロジック: hasExpiredをつけるだけ。削除しない。
      // ここでは、マウント時に既に期限切れになっているものをマークする
      const updatedTimers = timersData.map(timer => {
          if (!timer.hasExpired && timer.endTime <= now) {
             return { ...timer, hasExpired: true };
          }
          return timer;
      });
      
      const hasChanges = JSON.stringify(updatedTimers) !== JSON.stringify(timersData);
      
      if (hasChanges) {
          setTimersData(updatedTimers);
          // 変更があった場合は次のレンダリングでinterval設定などを行う
          return;
      }

      // 完全にアクティブ（期限切れでない）なタイマーがあるかチェック
      const anyActive = timersData.some(t => !t.hasExpired);
      if (anyActive) {
        startTimerInterval(timersData);
      }
    }

    // Chrome拡張機能のストレージにも同期（バックグラウンドで参照するため）
    if ((chrome as any)?.storage?.local) {
      (chrome as any).storage.local.set({ aiTaskFlow_timersData: timersData });
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timersData, startTimerInterval, setTimersData]);

  return {
    timersData,
    startTimer,
    cancelTimer,
    cancelAllTimers,
    getRemainingTime,
    getAllRemainingTimes,
  };
};

