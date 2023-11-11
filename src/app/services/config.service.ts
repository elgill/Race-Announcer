import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

console.log(environment.proxyUrl);


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {}

  getProxyUrl(){
    return environment.proxyUrl;
  }

}
