import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslationService } from './shared/translation.service';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import Lara from '@primeng/themes/lara';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

// Load translations at app startup
function initializeApp(translationService: TranslationService) {
  return () => {
    registerLocaleData(localeFi);
    return translationService.loadTranslations();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Lara,
        options: { darkModeSelector: false }
      }
    }),
    MessageService,
    provideAppInitializer(() => {
        const initializerFn = (initializeApp)(inject(TranslationService));
        return initializerFn();
      })
  ]
};