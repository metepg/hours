import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgStyle } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TimeEntryService } from './time-entry.service';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { HttpStatusCode } from '@angular/common/http';
import { TimeEntry } from './time-entry.model';
import { getDateStyle } from '../../../../utils/style.utils';
import { DocumentService } from './document.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import fi from '../../../../../../public/i18n/fi.json';
import { version } from '../../../../../../package.json';

@Component({
  selector: 'app-timesheet-form',
  imports: [
    CardModule,
    DatePipe,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    InputTextModule,
    InputNumberModule,
    Button,
    Select,
    DatePicker,
  ],
  templateUrl: './time-entry-form.component.html',
  styleUrl: './time-entry-form.component.css'
})

export class TimeEntryFormComponent implements OnInit {
  private readonly timeEntryService = inject(TimeEntryService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly documentService = inject(DocumentService);

  protected readonly getDateStyle = getDateStyle;
  version = version;
  timeEntryForm: FormGroup;
  startTime = new Date();
  endTime = new Date();
  selectedDate = new Date();
  today: Date = new Date();
  timeEntries: TimeEntry[] = [];
  isEditing = false;
  currentId: number | undefined = -1;
  hasEntryForSelectedDate: boolean = false;
  showPrintDialog = false;
  totalHours = '7h 30min';
  splits = [
    {name: '1', code: 1},
    {name: '2', code: 2},
  ];
  selectedSplit: any;
  months = [
    { name: 'Tammikuu', code: 1 },
    { name: 'Helmikuu', code: 2 },
    { name: 'Maaliskuu', code: 3 },
    { name: 'Huhtikuu', code: 4 },
    { name: 'Toukokuu', code: 5 },
    { name: 'Kesäkuu', code: 6 },
    { name: 'Heinäkuu', code: 7 },
    { name: 'Elokuu', code: 8 },
    { name: 'Syyskuu', code: 9 },
    { name: 'Lokakuu', code: 10 },
    { name: 'Marraskuu', code: 11 },
    { name: 'Joulukuu', code: 12 }
  ];
  selectedMonth: any;
  // Min year = 2024
  // Max year = current year + 2
  years = [...Array(new Date().getFullYear() - 2024 + 3).keys()]
    .map(i => {
      const year = 2024 + i;
      return { name: year.toString(), code: year };
    });
  selectedYear: any;
  hasLunch = true;

  constructor() {
    this.timeEntryForm = this.formBuilder.group({
      selectedDate: [this.selectedDate, Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['16:00', Validators.required],
      hasLunch: this.hasLunch
    });
  }

  ngOnInit() {
    this.timeEntryForm.valueChanges.subscribe(() => {
      const {hours, minutes} = this.calculateHours();
      this.totalHours = `${hours}h ${minutes}min`;
    });

    this.timeEntryService.getAll().subscribe({
      next: (timeEntries) => {
        this.timeEntries = timeEntries;

        const initialSelectedDate = this.timeEntryForm.get('selectedDate')?.value;
        this.onSelectedDateChange(initialSelectedDate);
      },
      error: (_) => {
        this.messageService.add({severity: 'error', summary: 'Virhe', detail: 'Kokeile kirjautua uudelleen sisään.', sticky: true});
      },

    });

    this.timeEntryForm.get('selectedDate')?.valueChanges.subscribe((selectedDate: Date) => {
      this.onSelectedDateChange(selectedDate);
    });
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    this.selectedYear = this.years.find(year => year.code === currentYear);
    this.selectedMonth = this.months.find(month => month.code === currentMonth);
    this.selectedSplit = this.splits[0];
  }

  private onSelectedDateChange(selectedDate: Date): void {
    if (!selectedDate) {
      return;
    }

    const entry = this.timeEntries.find((entry: TimeEntry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === selectedDate.getFullYear() &&
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getDate() === selectedDate.getDate()
      );
    });

    if (entry) {
      this.currentId = entry.id;
      this.setTimeFromValues(entry.startTime, entry.endTime);
      this.hasLunch = entry.hasLunch;
      this.hasEntryForSelectedDate = true;
    } else {
      this.currentId = undefined;
      this.setTimeFromValues('08:00', '16:00');
      this.hasEntryForSelectedDate = false;
      this.hasLunch = true;
    }
    this.updateFormControlsDisabledState();
  }

  onSubmit() {
    if (this.timeEntryForm.valid) {
      this.addEntry()
    } else {
      this.messageService.add({severity: 'error', summary: 'Virhe', detail: "Tiedoista puuttuu arvoja", sticky: true});
    }
  }

  private getDateInCorrectFormat(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private addEntry() {
    const timeEntry = this.getFormattedEntry();
    this.timeEntryService.add(timeEntry).subscribe({
      next: (timeEntry) => {
        this.timeEntries = [...this.timeEntries, timeEntry]
        const time = this.totalHours;
        this.messageService.add({severity: 'success', summary: 'Merkintä tallennettiin onnistuneesti!', detail: time});
        this.hasEntryForSelectedDate = true;
        this.timeEntryForm.get('startTime')?.disable();
        this.timeEntryForm.get('endTime')?.disable();
        this.currentId = timeEntry.id;
      },
      error: (response) => {
        if (response.status === HttpStatusCode.Conflict) {
          this.messageService.add({severity: 'error', summary: 'Virhe', detail: response.error.error, sticky: true});
        } else {
          this.messageService.add({severity: 'error', summary: 'Virhe', detail: 'Kokeile kirjautua uudelleen sisään.', sticky: true});
        }
      },
    });
  }

  private getFormattedEntry(): TimeEntry {
    const formattedDate = this.getDateInCorrectFormat(this.timeEntryForm.get('selectedDate')?.value);
    const startTime: string = this.timeEntryForm.get('startTime')?.value;
    const endTime: string = this.timeEntryForm.get('endTime')?.value;

    return {
      id: this.currentId,
      date: formattedDate,
      hasLunch: this.hasLunch,
      startTime,
      endTime,
    };
  }

  enableEditing() {
    this.isEditing = true;
    this.updateFormControlsDisabledState();
    this.timeEntryForm.get('selectedDate')?.disable();
  }

  disableEditing() {
    this.isEditing = false;
    this.updateFormControlsDisabledState();
    this.timeEntryForm.get('selectedDate')?.enable();
  }

  updateTimeEntry() {
    const entry = this.getFormattedEntry();
    this.timeEntryService.update(entry).subscribe({
      next: (timeEntry) => {
        const index = this.timeEntries.findIndex(e => e.id === timeEntry.id);
        if (index !== -1) {
          this.timeEntries[index] = timeEntry;
        } else {
          this.timeEntries = [...this.timeEntries, timeEntry];
        }

        const time = this.totalHours;
        this.messageService.add({severity: 'success', summary: 'Muokkaus tallennettu onnistuneesti!', detail: time});

        this.setTimeFromEntry(timeEntry);
      },
      error: (response) => {
        if (response.status === HttpStatusCode.Conflict) {
          this.messageService.add({severity: 'error', summary: 'Virhe', detail: response.error.error, sticky: true});
        } else {
          this.messageService.add({severity: 'error', summary: 'Virhe', detail: 'Kokeile kirjautua uudelleen sisään.', sticky: true});
        }
      },
      complete: () => {
        this.disableEditing();
      }
    });
  }

  private setTimeFromValues(startTimeStr: string, endTimeStr: string): void {
    this.timeEntryForm.patchValue({
      startTime: startTimeStr,
      endTime: endTimeStr
    });
  }

  private setTimeFromEntry(entry: TimeEntry | undefined): void {
    if (!entry) {
      return;
    }

    this.timeEntryForm.patchValue({
      startTime: entry.startTime,
      endTime: entry.endTime,
      hasLunch: entry.hasLunch
    });
  }

  private calculateHours(): { hours: number; minutes: number } {
    let startVal = this.timeEntryForm.get('startTime')?.value;
    let endVal = this.timeEntryForm.get('endTime')?.value;

    if (!startVal || !endVal) {
      return { hours: 0, minutes: 0 };
    }

    if (startVal instanceof Date) {
      startVal = `${String(startVal.getHours()).padStart(2, '0')}:${String(startVal.getMinutes()).padStart(2, '0')}`;
    }
    if (endVal instanceof Date) {
      endVal = `${String(endVal.getHours()).padStart(2, '0')}:${String(endVal.getMinutes()).padStart(2, '0')}`;
    }

    const [sH, sM] = startVal.split(':').map(Number);
    const [eH, eM] = endVal.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(sH, sM, 0, 0);

    const endDate = new Date();
    endDate.setHours(eH, eM, 0, 0);

    if (this.hasLunch) {
      endDate.setMinutes(endDate.getMinutes() - 30);
    }

    let diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (diffInMinutes < 0) diffInMinutes = 0;

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.floor(diffInMinutes % 60);

    return { hours, minutes };
  }

  deleteTimeEntry() {
    if (!this.currentId) return;
    const entry = this.timeEntries.find((entry) => entry.id === this.currentId);

    if (!entry) return;

    const date = new Date(entry.date);
    const weekday = fi.calendar.dayNames[date.getDay()];

    const formattedDate =
      `${weekday} ${date.toLocaleDateString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })}`;

    if (confirm(`Haluatko poistaa kirjauksen päivältä ${formattedDate}?`)) {

      this.timeEntryService.delete(this.currentId).subscribe({
          next: response => {
            if (response.status === HttpStatusCode.NoContent) {
              this.ngOnInit();
            }
          },
          error: (response) => {
            this.messageService.add({severity: 'error', summary: 'Virhe', detail: response.error.error, sticky: true});
          },
        }
      )
    }
  }

  generatePDF(): void {
    this.showPrintDialog = false
    const year = this.selectedYear.code;
    const month = this.selectedMonth.code;
    const split = this.selectedSplit.code;
    this.documentService.generatePDF(year, month, split).subscribe(response => {
      const blob = response.body;
      if (!blob) return;

      let filename = `Tunnit_${year}_${month}_kausi_${split}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private updateFormControlsDisabledState(): void {
    if (this.hasEntryForSelectedDate && !this.isEditing) {
      this.timeEntryForm.get('startTime')?.disable();
      this.timeEntryForm.get('endTime')?.disable();
    } else {
      this.timeEntryForm.get('startTime')?.enable();
      this.timeEntryForm.get('endTime')?.enable();
    }
  }

  toggleLunch() {
    this.hasLunch = !this.hasLunch;
    const {hours, minutes} = this.calculateHours();
    this.totalHours = `${hours}h ${minutes}min`;
    this.messageService.add({
      severity: this.hasLunch ? 'success' : 'error',
      summary: this.hasLunch ? 'Lounas' : 'Ei lounasta',
      detail: `- Päivän tunnit ${hours}h ${minutes}min`,
      life: 3000
    });
  }
}