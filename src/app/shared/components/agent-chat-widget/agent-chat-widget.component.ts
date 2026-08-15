import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

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
  private baseUrl = environment.baseUrl;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal<boolean>(false);
  isExpanded = signal<boolean>(false);
  isSending = signal<boolean>(false);
  userInput = signal<string>('');
  copiedMsgId = signal<string | null>(null);

  messages = signal<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'Hello! I am your WorkFit AI Sidekick. Ask me anything about your team, projects, or tasks.',
      timestamp: new Date()
    }
  ]);

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

  sendMessage(textToSend?: string) {
    const text = (textToSend || this.userInput()).trim();
    if (!text || this.isSending()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    this.messages.update(list => [...list, userMsg]);
    this.userInput.set('');
    this.isSending.set(true);
    setTimeout(() => this.scrollToBottom(), 50);

    // Call Backend endpoint or simulate dynamic assistant response
    this.http.post<any>(`${this.baseUrl}/api/agent/chat`, { prompt: text }).subscribe({
      next: (res) => {
        this.isSending.set(false);
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: res?.reply || res?.text || 'Request processed successfully.',
          timestamp: new Date()
        };
        this.messages.update(list => [...list, agentMsg]);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.isSending.set(false);
        const fallbackText = this.generateFallbackReply(text);
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: fallbackText,
          timestamp: new Date()
        };
        this.messages.update(list => [...list, agentMsg]);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private generateFallbackReply(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('project')) {
      return 'You can view and manage all active projects led by you under the Projects menu.';
    } else if (p.includes('team') || p.includes('developer') || p.includes('employee')) {
      return 'Manage your team members and assign organization developers under "My Team".';
    } else if (p.includes('jira') || p.includes('sync')) {
      return 'Jira integration settings and developer issue sync can be accessed from the Projects header.';
    }
    return `Received your message: "${prompt}". I am ready to assist with your team management tasks.`;
  }

  clearChat() {
    this.messages.set([
      {
        id: 'init-1',
        sender: 'agent',
        text: 'Chat history cleared. How else can I assist you?',
        timestamp: new Date()
      }
    ]);
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
