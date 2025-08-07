import { Injectable } from '@angular/core';
import { EventSourcePolyfill } from 'event-source-polyfill';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private ranges = {
    StartDate: '',
    EndDate: ''
  };

  private eventSource: EventSourcePolyfill | null = null;

  setRanges(StartDate: string, EndDate: string): void {
    this.ranges = { StartDate, EndDate };
  }

  getRanges() {
    return this.ranges;
  }

  startSimulation(
    onMessage: (data: any) => void,
    onError: (error: any) => void
  ): void {
    const url = 'http://localhost:5000/api/simulation/start';

    this.eventSource = new EventSourcePolyfill(url, {
      headers: {
        'Cache-Control': 'no-cache',
        Accept: 'text/event-stream'
      }
    });

    this.eventSource.onmessage = (event: MessageEvent) => {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    };

    this.eventSource.onerror = (error: Event) => {
      console.error('SSE error:', error);
      onError(error);
    };
  }

  stopSimulation(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
