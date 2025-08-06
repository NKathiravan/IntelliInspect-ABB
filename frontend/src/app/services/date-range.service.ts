import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {
  private ranges = {
    trainStart: '',
    trainEnd: '',
    testStart: '',
    testEnd: ''
  };

  setRanges(trainStart: string, trainEnd: string, testStart: string, testEnd: string): void {
    this.ranges = { trainStart, trainEnd, testStart, testEnd };
  }

  getRanges() {
    return this.ranges;
  }
}
