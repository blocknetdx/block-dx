import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Cryptocurrency } from './cryptocurrency';

@Injectable()
export class CryptocurrencyService {

  constructor(private http: Http) { }

  public getCurrencies(): Observable<Cryptocurrency[]> {

    // ToDo Connect cryptocurrency.service to data API

    return this.http.get('api/currency').map((res: Response) => {
      const data = res.json();
      return data.map((c) => Cryptocurrency.fromObject(c));
    });
  }

}
