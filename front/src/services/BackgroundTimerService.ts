/**
 * BackgroundTimerService
 *
 * Handles timers during offline periods using a Web Worker.
 * This service ensures that timers continue to work even when the app is in the background
 * or when the device is offline.
 */

import { ref, computed } from 'vue';
import type { IScheduledContent } from '@/types/content';

interface ITimerState {
  contentId: string;
  publishAt: Date;
  isActive: boolean;
  lastUpdated: Date;
}

export class BackgroundTimerService {
  private static instance: BackgroundTimerService;
  private worker: Worker | null = null;
  private timers = ref<Map<string, ITimerState>>(new Map());

  private constructor() {
    this.initializeWorker();
    this.setupEventListeners();
  }

  public static getInstance(): BackgroundTimerService {
    if (!BackgroundTimerService.instance) {
      BackgroundTimerService.instance = new BackgroundTimerService();
    }
    return BackgroundTimerService.instance;
  }

  private initializeWorker(): void {
    this.worker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  private setupEventListeners(): void {
    window.addEventListener('timer:start', ((event: CustomEvent) => {
      const { contentId, publishAt } = event.detail;
      this.startTimer(contentId, new Date(publishAt));
    }) as EventListener);

    window.addEventListener('timer:stop', ((event: CustomEvent) => {
      const { contentId } = event.detail;
      this.stopTimer(contentId);
    }) as EventListener);
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, contentId } = event.data;
    if (type === 'timer:complete') {
      this.handleTimerComplete(contentId);
    }
  }

  private handleTimerComplete(contentId: string): void {
    window.dispatchEvent(
      new CustomEvent('timer:complete', {
        detail: { contentId },
      })
    );
    this.stopTimer(contentId);
  }

  public startTimer(contentId: string, publishAt: Date): void {
    if (!this.worker) return;

    const timerState: ITimerState = {
      contentId,
      publishAt,
      isActive: true,
      lastUpdated: new Date(),
    };

    this.timers.value.set(contentId, timerState);
    this.worker.postMessage({
      type: 'timer:start',
      contentId,
      publishAt: publishAt.toISOString(),
    });
  }

  public stopTimer(contentId: string): void {
    if (!this.worker) return;

    this.timers.value.delete(contentId);
    this.worker.postMessage({
      type: 'timer:stop',
      contentId,
    });
  }

  public getTimerState(contentId: string): ITimerState | undefined {
    return this.timers.value.get(contentId);
  }

  public getAllTimerStates(): ITimerState[] {
    return Array.from(this.timers.value.values());
  }

  public cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.timers.value.clear();
  }
}

export const useBackgroundTimer = () => {
  const service = BackgroundTimerService.getInstance();
  return {
    startTimer: service.startTimer.bind(service),
    stopTimer: service.stopTimer.bind(service),
    getTimerState: service.getTimerState.bind(service),
    getAllTimerStates: service.getAllTimerStates.bind(service),
    cleanup: service.cleanup.bind(service),
  };
};
