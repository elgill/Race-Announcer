import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "./settings.service";

interface Race {
  id: string;
  date: string;
  location: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private settings: Settings = DEFAULT_SETTINGS;

  constructor(private http: HttpClient, private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  private getURL(url: string): string {
    const corsProxy = this.settings.proxyUrl;
    const separator = corsProxy && !corsProxy.endsWith('/') ? '/' : '';
    return corsProxy + separator + url;
  }

  fetchRaces(): Observable<Race[]> {
    const url = this.getURL('http://elitefeats.com/upcoming');
    return this.http.get(url, { responseType: 'text' }).pipe(
      map(response => {
        const parser = new DOMParser();
        const document = parser.parseFromString(response, 'text/html');
        const races: Race[] = [];

        document.querySelectorAll('section.post').forEach(section => {
          const isRedDate = section.querySelector('.RedDateDiv') !== null;
          const date = section.querySelector('.BlueDateDiv')?.textContent || section.querySelector('.RedDateDiv')?.textContent;
          const location = section.querySelector('div[style="text-align:center"] h3')?.textContent?.trim();
          let name = section.querySelector('h3[style="text-align:center;font-size: 1.2em"]')?.textContent?.trim();

          if (isRedDate && name) {
            name = `★ ${name}`;
          }

          const idElement = section.querySelector('a[href^="../race-results/?ID="]');
          const id = idElement?.getAttribute('href')?.split('=').pop();

          if (id && date && location && name) {
            races.push({ id, date, location, name });
          }
        });

        return races;
      }),
      catchError(error => {
        console.error('Error fetching races:', error);
        throw new Error('Failed to fetch races due to a network error.');
      })
    );
  }
}
