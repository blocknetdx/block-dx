import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { Openorder } from './openorder';


@Injectable()
export class OpenordersService {
  private openordersUrl = '';

  constructor(private http: Http) { }

  getOpenorders(symbols:string[]): Promise<Openorder[]> {
    const url = 'api/openorders_' + symbols.join("_");

    return this.http.get(url)
      .map(response => response.json() as Openorder[])
      .toPromise()
      .catch(this.handleError);
  }

  getFilledorders(symbols:string[]): Promise<Openorder[]> {
    const url = 'api/filledorders_' + symbols.join("_");

    return this.http.get(url)
      .map((res) => res.json() as Openorder[])
      .toPromise()
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
