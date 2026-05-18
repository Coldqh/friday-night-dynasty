import type { ReactNode } from 'react';
import { GAME_VERSION_LABEL } from '../version';
import { AppScreen, useGameStore } from '../store/useGameStore';

export const highSchoolNavigationTabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Главная' },
  { id: 'roster', label: 'Команды' },
  { id: 'prospects', label: 'Проспекты' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'rankings', label: 'Таблица' },
  { id: 'favorites', label: 'Избранные' },
  { id: 'history', label: 'История' }
];

export const collegeNavigationTabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Главная' },
  { id: 'roster', label: 'Команды' },
  { id: 'draft', label: 'Драфт' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'rankings', label: 'Таблица' },
  { id: 'favorites', label: 'Избранные' },
  { id: 'history', label: 'История' }
];

export const nflNavigationTabs: Array<{ id: AppScreen; label: string }> = [
  { id: 'dashboard', label: 'Главная' },
  { id: 'roster', label: 'Команды' },
  { id: 'draft', label: 'Драфт' },
  { id: 'schedule', label: 'Календарь' },
  { id: 'rankings', label: 'Таблица' },
  { id: 'history', label: 'История' }
];

export const navigationTabs = highSchoolNavigationTabs;

function tabsForLeague(league: 'highSchool' | 'college' | 'nfl') {
  if (league === 'college') return collegeNavigationTabs;
  if (league === 'nfl') return nflNavigationTabs;
  return highSchoolNavigationTabs;
}

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
          <h1>{world?.state.name ?? 'Новый мир'}</h1>
        </div>
      </header>

      <div className="league-switch">
        <button
          className={activeLeague === 'highSchool' ? 'filter-chip active' : 'filter-chip'}
          onClick={() => setActiveLeague('highSchool')}
        >
          Школа
        </button>
        <button
          className={activeLeague === 'college' ? 'filter-chip active' : 'filter-chip'}
          onClick={() => setActiveLeague('college')}
        >
          Колледж
        </button>
        <button
          className={activeLeague === 'nfl' ? 'filter-chip active' : 'filter-chip'}
          onClick={() => setActiveLeague('nfl')}
        >
          NFL
        </button>
      </div>

      <main className="screen">{children}</main>

      <nav className="bottom-nav">
        {tabsForLeague(activeLeague).map((tab) => (
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
