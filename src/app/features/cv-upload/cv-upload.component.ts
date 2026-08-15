import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CvUploadService } from '../../core/services/cv/cv-upload.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { CVUploadResponse, CVUploadItem } from '../../core/models/cv.models';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-upload.component.html',
})
export class CvUploadComponent implements OnInit {
  private cvUploadService = inject(CvUploadService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // ⭐ State
  isDragging = signal(false);
  isUploading = signal(false);
  uploadedFiles = signal<File[]>([]);
  organizationId = signal<string | null>(null);
  response = signal<CVUploadResponse | null>(null);
  showResults = signal(false);

  // ⭐ Computed
  totalFiles = computed(() => this.uploadedFiles().length);
  totalSize = computed(() => {
    return this.uploadedFiles().reduce((acc, file) => acc + file.size, 0);
  });
  formattedSize = computed(() => {
    const bytes = this.totalSize();
    if (bytes === 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  });
  hasStoredResults = computed(() => this.cvUploadService.hasStoredResults());

  // ⭐ Summary stats from response
  summary = computed(() => {
    const res = this.response();
    if (!res) return null;
    return {
      total: res.totalDocuments,
      succeeded: res.succeeded,
      failed: res.failed,
    };
  });

  maxFileSize = 10 * 1024 * 1024;

  ngOnInit(): void {
    this.loadOrganizationId();
    this.loadStoredResults();
  }

  loadOrganizationId(): void {
    this.authService.getOrganizationId().subscribe({
      next: (orgId) => {
        this.organizationId.set(orgId);
      },
      error: () => {
        this.toast.error('Error', 'Failed to load organization ID.');
      },
    });
  }

  loadStoredResults(): void {
    const stored = this.cvUploadService.getResults();
    if (stored) {
      this.response.set(stored);
      this.showResults.set(true);
    }
  }

  // ⭐ ==================== FILE HANDLING ====================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  addFiles(files: File[]): void {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (this.isValidFile(file) && file.size <= this.maxFileSize) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      this.toast.warning(
        'Invalid Files',
        `Skipped ${invalidFiles.length} file(s)`,
      );
    }

    if (validFiles.length > 0) {
      this.uploadedFiles.update((prev) => [...prev, ...validFiles]);
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.update((prev) => prev.filter((_, i) => i !== index));
  }

  clearAllFiles(): void {
    this.uploadedFiles.set([]);
  }

  isValidFile(file: File): boolean {
    return this.cvUploadService.isValidFile(file);
  }

  // ⭐ ==================== BULK UPLOAD ====================

  uploadCVs(): void {
    if (this.uploadedFiles().length === 0) {
      this.toast.warning('No Files', 'Please select at least one CV.');
      return;
    }

    const orgId = this.organizationId();
    if (!orgId) {
      this.toast.error('Error', 'Organization not found.');
      return;
    }

    this.isUploading.set(true);
    this.showResults.set(false);
    this.response.set(null);

    // ⭐ Upload ALL files in one bulk request
    this.cvUploadService.uploadCVs(orgId, this.uploadedFiles()).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.response.set(res);
        this.showResults.set(true);

        const message = this.getSuccessMessage(res);
        if (res.succeeded > 0 && res.failed === 0) {
          this.toast.success('Upload Complete! 🎉', message);
        } else if (res.succeeded > 0 && res.failed > 0) {
          this.toast.warning('Partial Success', message);
        } else {
          this.toast.error('Upload Failed', message);
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.toast.error('Error', err.error?.message || 'Upload failed.');
      },
    });
  }

  getSuccessMessage(res: CVUploadResponse): string {
    if (res.succeeded > 0 && res.failed === 0) {
      return `All ${res.succeeded} CV(s) processed successfully.`;
    } else if (res.succeeded > 0 && res.failed > 0) {
      return `${res.succeeded} succeeded, ${res.failed} failed.`;
    } else {
      return `All ${res.failed} CV(s) failed to process.`;
    }
  }

  resetUpload(): void {
    this.uploadedFiles.set([]);
    this.response.set(null);
    this.showResults.set(false);
    this.isUploading.set(false);
    this.cvUploadService.clearResults();
  }

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  getFileIcon(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'fa-regular fa-file-pdf text-red-500';
      case 'docx':
      case 'doc':
        return 'fa-regular fa-file-word text-blue-500';
      case 'txt':
        return 'fa-regular fa-file-lines text-gray-500';
      default:
        return 'fa-regular fa-file text-gray-400';
    }
  }

  getStatusClass(item: CVUploadItem): string {
    return item.success
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';
  }

  getStatusIcon(item: CVUploadItem): string {
    return item.success
      ? 'fa-regular fa-circle-check'
      : 'fa-regular fa-circle-xmark';
    }
    hasCredentials = computed(() => {
    const items = this.response()?.items || [];
    return items.some(item => item.success && item.generatedPassword);
  });

  // ⭐ Get count of successful credentials
  getCredentialsCount = (): number => {
    const items = this.response()?.items || [];
    return items.filter(item => item.success && item.generatedPassword).length;
  };

  // ⭐ Copy credentials to clipboard
  copyCredentials(): void {
    const items = this.response()?.items || [];
    const successful = items.filter(item => item.success && item.generatedPassword);

    if (successful.length === 0) {
      this.toast.warning('No Credentials', 'No successful credentials found to copy.');
      return;
    }

    let text = '=== WorkFit Employee Credentials ===\n';
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += '='.repeat(50) + '\n\n';

    successful.forEach((item, index) => {
      text += `[${index + 1}] Employee: ${item.employeeProfileId || 'N/A'}\n`;
      text += `    Password: ${item.generatedPassword}\n`;
      text += `    Document: ${item.fileName}\n`;
      text += '-'.repeat(30) + '\n';
    });

    text += '\n' + '='.repeat(50) + '\n';
    text += 'Please keep these credentials secure.\n';
    text += 'Employees can log in with their email and this password.\n';

    navigator.clipboard.writeText(text).then(
      () => {
        this.toast.success(
          'Copied! 📋',
          `${successful.length} credential(s) copied to clipboard.`
        );
      },
      (err) => {
        console.error('Failed to copy:', err);
        this.fallbackCopy(text);
      }
    );
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.toast.success(
        'Copied! 📋',
        'Credentials copied to clipboard (fallback method).'
      );
    } catch (err) {
      this.toast.error(
        'Copy Failed',
        'Unable to copy credentials. Please copy them manually.'
      );
    }
    document.body.removeChild(textarea);
  }
}
