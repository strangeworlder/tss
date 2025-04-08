import { defineStore } from 'pinia';

export type ThemeName = 'steampunk' | 'horror';
export type ColorMode = 'light' | 'dark';

interface IThemeState {
  currentTheme: ThemeName;
  colorMode: ColorMode;
}

type ThemeStore = IThemeState & {
  setTheme(theme: ThemeName): void;
  setColorMode(mode: ColorMode): void;
  applyTheme(): void;
  initializeTheme(): void;
};

export const useThemeStore = defineStore('theme', {
  state: (): IThemeState => ({
    currentTheme: 'steampunk',
    colorMode: 'light',
  }),

  getters: {
    isDarkMode(state: IThemeState): boolean {
      return state.colorMode === 'dark';
    },
  },

  actions: {
    setTheme(this: ThemeStore, theme: ThemeName): void {
      this.currentTheme = theme;
      localStorage.setItem('theme', theme);
      this.applyTheme();
    },

    setColorMode(this: ThemeStore, mode: ColorMode): void {
      this.colorMode = mode;
      localStorage.setItem('colorMode', mode);
      this.applyTheme();
    },

    applyTheme(this: ThemeStore): void {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      document.documentElement.setAttribute('data-color-mode', this.colorMode);
    },

    initializeTheme(this: ThemeStore): void {
      const savedTheme = localStorage.getItem('theme');
      const savedColorMode = localStorage.getItem('colorMode');

      if (savedTheme) this.currentTheme = savedTheme as ThemeName;
      if (savedColorMode) this.colorMode = savedColorMode as ColorMode;

      this.applyTheme();
    },
  },
});
