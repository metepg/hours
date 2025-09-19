import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TimeEntryFormComponent } from './src/app/features/time-entry-form/time-entry-form.component';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-root',
    imports: [FormsModule, CardModule, TimeEntryFormComponent, ToastModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})

export class AppComponent {
  constructor() {}
}