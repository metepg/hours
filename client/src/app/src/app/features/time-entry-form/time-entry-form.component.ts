import { Component, OnInit } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, formatDate, NgStyle } from '@angular/common';
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
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-timesheet-form',
  standalone: true,
  imports: [
    CalendarModule,
    CardModule,
    DatePipe,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
  ],
  templateUrl: './time-entry-form.component.html',
  styleUrl: './time-entry-form.component.css'
})

export class TimeEntryFormComponent implements OnInit {
  protected readonly getDateStyle = getDateStyle;
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
  years = [
    { name: '2024', code: 2024 },
    { name: '2025', code: 2025 },
    { name: '2026', code: 2026 },
    { name: '2027', code: 2027 },
    { name: '2028', code: 2028 },
    { name: '2029', code: 2029 },
    { name: '2030', code: 2030 },
    { name: '2031', code: 2031 },
    { name: '2032', code: 2032 },
    { name: '2033', code: 2033 },
    { name: '2034', code: 2034 }
  ];
  selectedYear: any;

  constructor(private timeEntryService: TimeEntryService,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private documentService: DocumentService)
  {
    this.timeEntryForm = this.formBuilder.group({
      selectedDate: [this.selectedDate, Validators.required],
      startTime: [this.createTime('08:00'), Validators.required],
      endTime: [this.createTime('16:00'), Validators.required],
    });
  }

  ngOnInit() {
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
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-indexed month

    // Set default selections to the current year, current month, and split = 1
    this.selectedYear = this.years.find(year => year.code === currentYear);
    this.selectedMonth = this.months.find(month => month.code === currentMonth);
    this.selectedSplit = this.splits[0]; // Default split to 1
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
      this.hasEntryForSelectedDate = true;
    } else {
      this.currentId = undefined;
      this.setTimeFromValues('08:00', '16:00');
      this.hasEntryForSelectedDate = false;
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
        const time = this.getHoursMsg(timeEntry);
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
    const formattedStartTime = formatDate(this.timeEntryForm.get('startTime')?.value, 'HH:mm', 'fi-FI');
    const formattedEndTime = formatDate(this.timeEntryForm.get('endTime')?.value, 'HH:mm', 'fi-FI');
    return {
      id: this.currentId,
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
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

        const time = this.getHoursMsg(timeEntry);
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
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    this.timeEntryForm.patchValue({
      startTime: startTime,
      endTime: endTime
    });
  }

  private setTimeFromEntry(entry: TimeEntry | undefined): void {
    if (!entry) return;
    const [startHour, startMinute] = entry.startTime.split(':').map(Number);
    const [endHour, endMinute] = entry.endTime.split(':').map(Number);

    this.startTime.setHours(startHour, startMinute, 0);
    this.endTime.setHours(endHour, endMinute, 0);

    this.timeEntryForm.patchValue({
      startTime: this.startTime,
      endTime: this.endTime
    });
  }

  private getHoursMsg(entry: TimeEntry): string {
    const [startHour, startMinute] = entry.startTime.split(':').map(Number);
    const [endHour, endMinute] = entry.endTime.split(':').map(Number);

    const startTime = new Date(0, 0, 0, startHour, startMinute);
    const endTime = new Date(0, 0, 0, endHour, endMinute);

    const diffInMs = endTime.getTime() - startTime.getTime();

    const diffInMinutes = diffInMs / (1000 * 60);

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.floor(diffInMinutes % 60);

    return `Kirjatut tunnit: ${hours}h ${minutes}min`;
  }

  deleteTimeEntry() {
    if (!this.currentId) return;

    if (confirm("Haluatko poistaa kirjauksen?")) {

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

  private createTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

}