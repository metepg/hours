import { Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class TranslationService {

  constructor(private primengConfig: PrimeNGConfig, private http: HttpClient) {}

  loadTranslations(): void {
    this.http.get('/i18n/fi.json').subscribe((data: any) => {
      this.primengConfig.setTranslation(data.calendar);
    });
  }
}
