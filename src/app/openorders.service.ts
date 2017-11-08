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
    this.openordersUrl = 'api/openorders_' + symbols.join("_");

    return this.http.get(this.openordersUrl)
       .toPromise()
       .then(response => response.json() as Openorder[])
       .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
