import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string): any {
    const d = new Date(value);
    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - d.getTime())/1000));
    const minutes = Math.round(Math.abs(seconds/60));
    const hours = Math.round(Math.abs(minutes/60));
    const days = Math.round(Math.abs(hours/24));
    const weeks = Math.round(Math.abs(days/7));
    const months = Math.round(Math.abs(days/30.416));
    const years = Math.round(Math.abs(days/365));

    if (seconds <= 60) {
      return 'now';
    } else if (minutes <= 60) {
      return `${minutes}m ago`;
    } else if (hours <= 24) {
      return `${hours}h ago`;
    } else if (days <= 7) {
      return `${days}d ago`;
    } else if (weeks <= 4) {
      return `${weeks}w ago`;
    } else if (months <= 12) {
      return `${months}m ago`;
    } else {
      return `${years}y ago`;
    }
  }

}
