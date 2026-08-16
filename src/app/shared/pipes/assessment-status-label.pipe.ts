// shared/pipes/assessment-status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { AssessmentStatus } from '../../core/models/assessment.model';

@Pipe({
  name: 'assessmentStatusLabel',
  standalone: true,
})
export class AssessmentStatusLabelPipe implements PipeTransform {
  transform(status: AssessmentStatus): string {
    switch (status) {
      case AssessmentStatus.Approved:
        return 'Approved';
      case AssessmentStatus.Rejected:
        return 'Rejected';
      default:
        return 'Pending';
    }
  }
}
