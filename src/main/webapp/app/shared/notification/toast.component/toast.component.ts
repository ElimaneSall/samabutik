import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes, faWarning } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../toast.service';

@Component({
  selector: 'jhi-toast',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faInfoCircle = faInfoCircle;
  faWarning = faWarning;
  faTimes = faTimes;

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-800';
    }
  }

  getIcon(type: string) {
    switch (type) {
      case 'success':
        return this.faCheckCircle;
      case 'error':
        return this.faExclamationCircle;
      case 'warning':
        return this.faWarning;
      default:
        return this.faInfoCircle;
    }
  }
}
