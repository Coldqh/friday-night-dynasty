import type { ReactNode } from 'react';
import { GAME_VERSION } from '../version';
import { AppScreen, useGameStore } from '../store/useGameStore';

export const navigationTabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'roster', label: 'Teams' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'rankings', label: 'Standings' },
  { id: 'news', label: 'News' },
  { id: 'history', label: 'History' }
];

export function Layout({ children }: { children: ReactNode }) {
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const world = useGameStore((state) => state.world);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Friday Night Dynasty / {GAME_VERSION}</div>
          <h1>{world?.state.name ?? 'New State'}</h1>
        </div>
        <div className="year-pill">{world?.currentYear}</div>
      </header>

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
