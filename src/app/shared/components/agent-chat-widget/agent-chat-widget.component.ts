import { Component, DestroyRef, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';
import { TaskService } from '../../../core/services/task/task.service';
import { ProjectService } from '../../../core/services/project/project.service';
import { TaskListItem } from '../../../core/models/task.models';
import { Project } from '../../../core/models/project.models';

export interface AgentCandidate {
  employeeId: string;
  employeeName: string;
  rank: number;
  score: number;
  availableAllocation: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

interface AgentChatResponse {
  reply: string;
  recommendationId: string | null;
  taskId: string | null;
  candidates: AgentCandidate[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  candidates?: AgentCandidate[];
}

export type ChatMode = 'none' | 'recommendation' | 'vector';

@Component({
  selector: 'app-agent-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-chat-widget.component.html',
  styleUrl: './agent-chat-widget.component.scss'
})
export class AgentChatWidgetComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);
  private readonly agentChatUrl = `${environment.baseUrl}/agent/chat`;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal<boolean>(false);
  isExpanded = signal<boolean>(false);
  isSending = signal<boolean>(false);
  userInput = signal<string>('');
  copiedMsgId = signal<string | null>(null);

  chatMode = signal<ChatMode>('none');
  isControlsCollapsed = signal<boolean>(false);

  // Separate chat message history for each mode
  recommendationMessages = signal<ChatMessage[]>([]);
  vectorMessages = signal<ChatMessage[]>([]);

  // Computed current active messages list depending on selected mode
  activeMessages = computed<ChatMessage[]>(() => {
    const mode = this.chatMode();
    if (mode === 'recommendation') {
      return this.recommendationMessages();
    } else if (mode === 'vector') {
      return this.vectorMessages();
    }
    return [];
  });

  projects = signal<Project[]>([]);
  selectedProjectId = signal<string>('');
  projectTasks = signal<TaskListItem[]>([]);
  selectedTaskId = signal<string>('');
  isLoadingProjects = signal<boolean>(false);
  isLoadingTasks = signal<boolean>(false);

  constructor() {
    this.loadProjects();
    this.syncWithRoute(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => this.syncWithRoute(event.urlAfterRedirects));
  }

  setMode(mode: ChatMode): void {
    this.chatMode.set(mode);
    if (mode === 'recommendation' && this.recommendationMessages().length === 0) {
      this.recommendationMessages.set([
        {
          id: 'init-rec',
          sender: 'agent',
          text: 'Task Recommendation Mode Active. Select a Project, then select a Task to generate employee recommendations.',
          timestamp: new Date()
        }
      ]);
    } else if (mode === 'vector' && this.vectorMessages().length === 0) {
      this.vectorMessages.set([
        {
          id: 'init-vec',
          sender: 'agent',
          text: 'Vector DB Search Mode Active. Type any prompt or query to search across the vector database.',
          timestamp: new Date()
        }
      ]);
    }
    setTimeout(() => this.scrollToBottom(), 50);
  }

  toggleControlsCollapse(): void {
    this.isControlsCollapsed.update(v => !v);
  }

  refreshAll(): void {
    this.loadProjects(false);
    if (this.selectedProjectId()) {
      this.refreshTasks();
    }
  }

  loadProjects(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoadingProjects.set(true);
    }
    this.projectService.getProjectsForTeamLead().subscribe({
      next: list => {
        const teamLeadProjects = list || [];
        this.projects.set(teamLeadProjects);
        this.isLoadingProjects.set(false);

        if (!this.selectedProjectId() && teamLeadProjects.length === 1) {
          this.onProjectChange(teamLeadProjects[0].id);
        }
      },
      error: () => this.isLoadingProjects.set(false)
    });
  }

  refreshTasks(): void {
    const currentProjectId = this.selectedProjectId();
    if (currentProjectId) {
      this.taskService.getProjectTasks(currentProjectId).subscribe({
        next: tasks => {
          this.projectTasks.set(tasks || []);
        }
      });
    }
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.selectedTaskId.set('');
    this.projectTasks.set([]);

    if (!projectId) return;

    this.isLoadingTasks.set(true);
    this.taskService.getProjectTasks(projectId).subscribe({
      next: tasks => {
        this.projectTasks.set(tasks || []);
        this.isLoadingTasks.set(false);
      },
      error: () => this.isLoadingTasks.set(false)
    });
  }

  toggleChat() {
    this.isOpen.update(v => {
      const nextState = !v;
      if (nextState) {
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        this.isExpanded.set(false);
      }
      return nextState;
    });
  }

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  copyMessageText(msg: ChatMessage) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(msg.text).then(() => {
      this.copiedMsgId.set(msg.id);
      setTimeout(() => this.copiedMsgId.set(null), 2000);
    });
  }

  openEmployeeProfile(employeeId: string): void {
    if (!employeeId) return;
    this.router.navigate(['/employees', employeeId]);
  }

  sendRecommendation(): void {
    const taskId = this.selectedTaskId();
    const projectId = this.selectedProjectId();
    if (!taskId || !projectId || this.isSending()) return;

    const project = this.projects().find(p => p.id === projectId);
    const task = this.projectTasks().find(t => t.id === taskId);
    const projectName = project ? project.name : 'Selected Project';
    const taskTitle = task ? task.title : 'Selected Task';

    const promptText = `Recommend the best employee for task "${taskTitle}" in project "${projectName}".`;
    
    // Reset selection dropdowns after sending so Task Select is hidden (display: none)
    this.selectedTaskId.set('');
    this.selectedProjectId.set('');
    this.projectTasks.set([]);

    // Automatically collapse controls panel down after sending
    this.isControlsCollapsed.set(true);

    this.sendMessageInternal(promptText, taskId, projectId);
  }

  sendVectorPrompt(): void {
    const text = this.userInput().trim();
    if (!text || this.isSending()) return;
    this.sendMessageInternal(text, null, null);
  }

  private sendMessageInternal(promptText: string, taskId: string | null, projectId: string | null): void {
    const currentMode = this.chatMode();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date()
    };

    if (currentMode === 'recommendation') {
      this.recommendationMessages.update(list => [...list, userMsg]);
    } else if (currentMode === 'vector') {
      this.vectorMessages.update(list => [...list, userMsg]);
    }

    this.userInput.set('');
    setTimeout(() => this.scrollToBottom(), 50);

    this.isSending.set(true);

    this.http.post<AgentChatResponse>(this.agentChatUrl, {
      taskId: taskId,
      projectId: projectId,
      prompt: promptText,
      resultLimit: 5,
    }).subscribe({
      next: (res) => {
        this.isSending.set(false);
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: res.reply,
          timestamp: new Date(),
          candidates: res.candidates,
        };

        if (currentMode === 'recommendation') {
          this.recommendationMessages.update(list => [...list, agentMsg]);
        } else if (currentMode === 'vector') {
          this.vectorMessages.update(list => [...list, agentMsg]);
        }

        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (error: HttpErrorResponse) => {
        this.isSending.set(false);
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: this.errorMessage(error),
          timestamp: new Date()
        };

        if (currentMode === 'recommendation') {
          this.recommendationMessages.update(list => [...list, agentMsg]);
        } else if (currentMode === 'vector') {
          this.vectorMessages.update(list => [...list, agentMsg]);
        }

        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private syncWithRoute(url: string): void {
    const routeProjectId = url.match(/^\/projects\/([0-9a-f-]{36})(?:[/?#]|$)/i)?.[1];
    if (routeProjectId && routeProjectId !== this.selectedProjectId()) {
      this.onProjectChange(routeProjectId);
    }
  }

  private errorMessage(error: HttpErrorResponse): string {
    const body = error.error;
    return body?.userFriendlyMessage || body?.errorMessage || body?.detail || body?.title || body?.message ||
      'The analysis could not be completed. Check that the backend, Qdrant, and AI provider are available.';
  }

  clearChat() {
    const mode = this.chatMode();
    if (mode === 'recommendation') {
      this.recommendationMessages.set([]);
    } else if (mode === 'vector') {
      this.vectorMessages.set([]);
    } else {
      this.recommendationMessages.set([]);
      this.vectorMessages.set([]);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTo({
          top: this.scrollContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch { }
  }
}
