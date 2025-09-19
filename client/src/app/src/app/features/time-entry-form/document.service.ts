import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/document';

  generatePDF(year: number, month: number, split: number): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(`${this.apiUrl}/pdf`, {
      params: {
        year: year.toString(),
        month: month.toString(),
        split: split.toString()
      },
      responseType: 'blob' as 'json',
      observe: 'response'
    });
  }

}
