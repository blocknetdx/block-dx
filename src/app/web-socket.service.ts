import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class WebSocketService {
  public socket: Subject<any>;

  constructor() {}

  public connect(url): Subject<any> {
    if (!this.socket) {
      this.socket = this.create(url);
    }
    return this.socket;
  }

  private create(url): Subject<any> {
    const ws = new WebSocket(url);

    const observable = Observable.create((obs: Observer<any>) => {
      ws.onopen = obs.next.bind(obs);
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      return ws.close.bind(ws);
    });

    const observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }

}
