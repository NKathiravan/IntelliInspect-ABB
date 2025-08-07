declare module 'event-source-polyfill' {
  export class EventSourcePolyfill {
    constructor(url: string, eventSourceInitDict?: any);
    close(): void;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((error: Event) => void) | null;
  }
}
