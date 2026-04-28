import type { ReactNode } from 'react';
import { useGameStore, AppScreen } from '../store/useGameStore';

const tabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Мир' },
  { id: 'roster', label: 'Команды' },
  { id: 'teamProfile', label: 'Команда' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'rankings', label: 'Таблица' },
  { id: 'news', label: 'Новости' },
  { id: 'history', label: 'История' }
];

export function Layout({ children }: { children: ReactNode }) {
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const world = useGameStore((state) => state.world);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Friday Night Dynasty</div>
          <h1>{world?.state.name ?? 'Новый штат'}</h1>
        </div>
        <div className="year-pill">{world?.currentYear}</div>
      </header>

      <main className="screen">{children}</main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
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
