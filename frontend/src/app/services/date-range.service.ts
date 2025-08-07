import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // This makes the service globally available
})
export class DateRangeService {
  private ranges = {
    trainStart: '',
    trainEnd: '',
    testStart: '',
    testEnd: ''
  };

  // Set all date ranges
  setRanges(trainStart: string, trainEnd: string, testStart: string, testEnd: string): void {
    this.ranges = { trainStart, trainEnd, testStart, testEnd };
  }

  // Get all date ranges
  getRanges() {
    return this.ranges;
  }

  // Optional: Set only training range
  setTrainingRange(start: string, end: string): void {
    this.ranges.trainStart = start;
    this.ranges.trainEnd = end;
  }

  // Optional: Set only testing range
  setTestingRange(start: string, end: string): void {
    this.ranges.testStart = start;
    this.ranges.testEnd = end;
  }

  // Optional: Get only training range
  getTrainingRange() {
    return {
      start: this.ranges.trainStart,
      end: this.ranges.trainEnd
    };
  }

  // Optional: Get only testing range
  getTestingRange() {
    return {
      start: this.ranges.testStart,
      end: this.ranges.testEnd
    };
  }
}
