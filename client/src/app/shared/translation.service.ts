import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private primeng: PrimeNG, private http: HttpClient) {}

  loadTranslations(): void {
    this.http.get('/i18n/fi.json').subscribe((data: any) => {
      this.primeng.setTranslation(data.calendar);
    });
  }
}