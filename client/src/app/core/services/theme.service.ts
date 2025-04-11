import {inject, Injectable, signal} from '@angular/core';
import {DOCUMENT} from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeKey = 'camp-theme';
  currentTheme = signal<Theme>('light');

  constructor() {
    this.loadTheme();
  }

  toggleTheme() {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    this.applyThemeToDOM(theme);
    this.saveTheme();
  }

  saveTheme() {
    localStorage.setItem(this.themeKey, this.currentTheme());
  }

  loadTheme() {
    const theme = this.getPreferredTheme();
    this.setTheme(theme);
  }

  applyThemeSynchronously() {
    const theme = this.getPreferredTheme();
    this.currentTheme.set(theme);
    this.applyThemeToDOM(theme);
  }

  private getPreferredTheme(): Theme {
    const savedTheme = localStorage.getItem(this.themeKey) as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyThemeToDOM(theme: Theme) {
    if (theme === 'dark') {
      this.document.documentElement.classList.add('dark-mode');
    } else {
      this.document.documentElement.classList.remove('dark-mode');
    }
  }
}
