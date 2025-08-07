import { Component, Renderer2, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <button (click)="toggleDarkMode()" class="dark-mode-toggle">
      {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
    </button>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .dark-mode-toggle {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      padding: 6px 12px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background-color: var(--color-btn-primary);
      color: var(--color-text-light);
      box-shadow: 0 2px 6px rgba(24, 87, 182, 0.3);
      transition: background-color 0.3s ease;
    }
    .dark-mode-toggle:hover {
      background-color: var(--color-btn-primary-hover);
    }
  `]
})
export class AppComponent implements OnInit {
  darkMode = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    if (localStorage.getItem('darkMode') === 'true') this.enableDarkMode();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) this.enableDarkMode();
    else this.disableDarkMode();
  }

  private enableDarkMode() {
    this.renderer.addClass(document.body, 'dark-mode');
    localStorage.setItem('darkMode', 'true');
  }

  private disableDarkMode() {
    this.renderer.removeClass(document.body, 'dark-mode');
    localStorage.setItem('darkMode', 'false');
  }
}
export { AppComponent as App };
