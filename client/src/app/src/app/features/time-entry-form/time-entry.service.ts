import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntry } from './time-entry.model';

@Injectable({providedIn: 'root'})
export class TimeEntryService {
  private apiUrl = '/api/time-entry';

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.apiUrl}`);
  }

  add(entry: TimeEntry): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.apiUrl}/add`, entry);
  }

  update(entry: TimeEntry): Observable<TimeEntry> {
    return this.http.put<TimeEntry>(`${this.apiUrl}/update`, entry);
  }

  delete(id: number): Observable<HttpResponse<void>> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { observe: 'response' });
  }
}
