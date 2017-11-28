import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  // state('*', style({ opacity: 1})),
  state('visible', style({ opacity: 1})),
  state('hidden', style({ opacity: 0})),
  transition('void => *', [
    style({ opacity: 0 }),
    animate('0.26s ease-out')
  ]),
  transition('* => void', [
    animate('0.26s ease', style({ opacity: 0}))
  ]),
  transition('visible <=> hidden', animate('0.26s ease'))
]);
