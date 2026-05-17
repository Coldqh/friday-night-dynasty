import type { ReactNode } from 'react';
import { GAME_VERSION_LABEL } from '../version';
import { AppScreen, useGameStore } from '../store/useGameStore';

export const navigationTabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Главная' },
  { id: 'roster', label: 'Команды' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'rankings', label: 'Таблица' },
  { id: 'favorites', label: 'Избранные' },
  { id: 'history', label: 'История' }
];

export function Layout({ children }: { children: ReactNode }) {
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const world = useGameStore((state) => state.world);
  const activeLeague = useGameStore((state) => state.activeLeague);
  const setActiveLeague = useGameStore((state) => state.setActiveLeague);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Friday Night Dynasty / {GAME_VERSION_LABEL}</div>
          <h1>{world?.state.name ?? 'Новый штат'}</h1>
        </div>
        <div className="year-pill">{world?.currentYear}</div>
      </header>

      <div className="league-switch">
        <button
          className={activeLeague === 'highSchool' ? 'filter-chip active' : 'filter-chip'}
          onClick={() => setActiveLeague('highSchool')}
        >
          Старшая школа
        </button>
        <button
          className={activeLeague === 'college' ? 'filter-chip active' : 'filter-chip'}
          onClick={() => setActiveLeague('college')}
        >
          Колледжи
        </button>
      </div>

      <main className="screen">{children}</main>

      <nav className="bottom-nav">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            className={screen === tab.id ? 'nav-button active' : 'nav-button'}
            onClick={() => setScreen(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
