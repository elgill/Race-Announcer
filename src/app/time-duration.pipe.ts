import { Pipe, PipeTransform } from '@angular/core';
import { formatTimeDuration } from './time-utils';

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {
  transform(startTime: Date | undefined, endTime: Date | undefined): string {
    return formatTimeDuration(startTime, endTime);
  }
}
