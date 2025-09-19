import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private primeng = inject(PrimeNG);
  private http = inject(HttpClient);

  loadTranslations(): void {
    this.http.get('/i18n/fi.json').subscribe((data: any) => {
      this.primeng.setTranslation(data.calendar);
    });
  }
}