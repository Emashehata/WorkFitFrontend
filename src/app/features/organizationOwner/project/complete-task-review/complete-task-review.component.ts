import { Component, input, output, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { finalize } from 'rxjs';
import { TaskCompleteWithCodeReviewResponse } from '../../../../core/models/task-completion.model';
import { TaskService } from '../../../../core/services/task/task.service';
 
@Component({
  selector: 'app-complete-task-review',
  standalone: true,
  imports: [NgClass],
  templateUrl: './complete-task-review.component.html',
})
export class CompleteTaskReviewComponent {
  private taskService = inject(TaskService);

  taskId = input.required<string>();
  closed = output<void>();

  result = signal<TaskCompleteWithCodeReviewResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  constructor() {
    this.run();
  }

  run() {
    this.loading.set(true);
    this.error.set(false);
    this.taskService
      .completeTaskWithCodeReview(this.taskId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.result.set(res),
        error: () => this.error.set(true),
      });
  }

  riskClass(risk: string): string {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-success/15 text-success';
      case 'medium':
        return 'bg-warning/15 text-warning';
      case 'high':
        return 'bg-danger/15 text-danger';
      default:
        return 'bg-background text-text-secondary';
    }
  }

  severityClass(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'bg-warning/15 text-warning';
      case 'medium':
        return 'bg-danger/15 text-danger';
      case 'high':
      case 'critical':
        return 'bg-danger/25 text-danger';
      default:
        return 'bg-background text-text-secondary';
    }
  }

  onClose() {
    this.closed.emit();
  }
}