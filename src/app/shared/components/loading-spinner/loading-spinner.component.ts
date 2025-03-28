import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="spinner">
          <div class="spinner-border"></div>
        </div>
      </div>
    }
  `,
  styles: `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .spinner {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
      border: 0.25rem solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
} 