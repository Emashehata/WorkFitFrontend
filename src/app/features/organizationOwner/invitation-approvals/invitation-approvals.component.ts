import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { InvitationDto } from '../../../core/models/invitation.models';
import { InvitationService } from '../../../core/services/invitation/invitation.service';

@Component({
  selector: 'app-invitation-approvals',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './invitation-approvals.component.html',
  styleUrl: './invitation-approvals.component.scss',
})
export class InvitationApprovalsComponent implements OnInit {
  private invitationService = inject(InvitationService);

  invitations = signal<InvitationDto[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  decisionStates = signal<Record<string, 'approve' | 'reject'>>({});
  decisionErrors = signal<Record<string, string>>({});
  developmentInvitationUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.invitationService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.invitations.set(invitations);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(this.apiError(err, 'Pending invitation requests could not be loaded.'));
        this.loading.set(false);
      },
    });
  }

  review(invitation: InvitationDto, approve: boolean): void {
    this.decisionStates.update((states) => ({ ...states, [invitation.id]: approve ? 'approve' : 'reject' }));
    this.decisionErrors.update((errors) => ({ ...errors, [invitation.id]: '' }));
    if (approve) this.developmentInvitationUrl.set(null);

    this.invitationService.reviewInvitation(invitation.id, approve).subscribe({
      next: (response) => {
        this.invitations.update((items) => items.filter((item) => item.id !== invitation.id));
        this.decisionStates.update((states) => {
          const next = { ...states };
          delete next[invitation.id];
          return next;
        });
        if (response.developmentInvitationUrl) {
          this.developmentInvitationUrl.set(response.developmentInvitationUrl);
        }
      },
      error: (err) => {
        this.decisionStates.update((states) => {
          const next = { ...states };
          delete next[invitation.id];
          return next;
        });
        this.decisionErrors.update((errors) => ({
          ...errors,
          [invitation.id]: this.apiError(err, `The invitation could not be ${approve ? 'approved' : 'rejected'}.`),
        }));
      },
    });
  }

  private apiError(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.title || err?.error?.userFriendlyMessage || fallback;
  }
}
