import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../constants/api-routes.constant';
import { CVUploadResponse } from '../../models/cv.models';

@Injectable({ providedIn: 'root' })
export class CvUploadService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7296/api';

  private readonly STORAGE_KEY = 'workfit_cv_upload_results';

  private uploadResults = signal<CVUploadResponse | null>(null);
  readonly results = this.uploadResults.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Upload multiple CVs in bulk
   * POST /api/workflow/cvs/upload
   */
  uploadCVs(
    organizationId: string,
    files: File[],
  ): Observable<CVUploadResponse> {
    const formData = new FormData();
    formData.append('organizationId', organizationId);

    // ⭐ Append ALL files to the same FormData
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    console.log(`📤 Uploading ${files.length} CV(s) to RAG system...`);

    return this.http
      .post<CVUploadResponse>(
        `${this.baseUrl}${API_ROUTES.workflow.cvsUpload}`,
        formData,
      )
      .pipe(
        tap((response) => {
          console.log(
            `✅ Upload complete: ${response.succeeded} succeeded, ${response.failed} failed`,
          );
          this.uploadResults.set(response);
          this.saveToStorage(response);
        }),
        catchError((error) => {
          console.error('❌ Bulk upload failed:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Get results from memory or localStorage
   */
  getResults(): CVUploadResponse | null {
    const memoryResults = this.uploadResults();
    if (memoryResults) {
      return memoryResults;
    }
    return this.loadFromStorage();
  }

  /**
   * Clear results from both memory and localStorage
   */
  clearResults(): void {
    this.uploadResults.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if there are stored results
   */
  hasStoredResults(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Save response to localStorage
   */
  private saveToStorage(response: CVUploadResponse): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response));
    } catch (error) {
      console.error('Failed to save CV upload results to localStorage:', error);
    }
  }

  /**
   * Load response from localStorage
   */
  private loadFromStorage(): CVUploadResponse | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.uploadResults.set(parsed);
        return parsed;
      }
    } catch (error) {
      console.error(
        'Failed to load CV upload results from localStorage:',
        error,
      );
    }
    return null;
  }

  /**
   * Check if a file is a valid CV
   */
  isValidFile(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return (
      allowedTypes.includes(file.type) ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.txt')
    );
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
