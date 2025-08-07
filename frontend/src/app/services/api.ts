
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api';

  getData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/data`);
  }

  // Updated method to accept FormData for file uploads
  // HttpClient automatically sets the correct 'Content-Type: multipart/form-data' header
  // when you pass a FormData object, so no need to manually set it.
  postFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Dataset/upload`, formData);
  }
}
