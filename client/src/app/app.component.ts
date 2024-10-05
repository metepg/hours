import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TimeEntryFormComponent } from './src/app/features/time-entry-form/time-entry-form.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, RouterOutlet, CalendarModule, FormsModule, DatePipe, CardModule, TimeEntryFormComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  constructor() {}
}