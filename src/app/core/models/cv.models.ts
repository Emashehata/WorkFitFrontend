export interface CVUploadRequest {
  organizationId: string;
  files: File[];
}

export interface CVUploadResponse {
  totalDocuments: number;
  succeeded: number;
  failed: number;
  items: CVUploadItem[];
}

export interface CVUploadItem {
  documentId: string;
  fileName: string;
  success: boolean;
  error: string | null;
  identityUserId: string | null;
  employeeProfileId: string | null;
  assessmentId: string | null;
  generatedPassword: string | null;
}
