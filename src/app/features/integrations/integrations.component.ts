// features/integrations/integrations.component.ts
import { Component } from '@angular/core';
import { GitHubConnectComponent } from '../../shared/components/github-connect/github-connect.component';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [GitHubConnectComponent],
  templateUrl: './integrations.component.html',
})
export class IntegrationsComponent {}