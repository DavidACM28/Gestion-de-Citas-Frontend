import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface EndpointConfig {
  url: string;
}

@Injectable({
  providedIn: 'root',
})

export class ApiServiceFactory {
  private readonly baseUrl = environment.apiUrl;

  create(apiPath: string): EndpointConfig {
    return { url: `${this.baseUrl}${apiPath}` };
  }
}
