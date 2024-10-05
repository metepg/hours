import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslationService } from './shared/translation.service';
import { registerLocaleData } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import { MessageService } from 'primeng/api';

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
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TranslationService],
      multi: true,
    }
  ]
};