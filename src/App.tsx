import { Layout } from './app/components/Layout';
import { HomeScreen } from './app/screens/HomeScreen';
import { DashboardScreen } from './app/screens/DashboardScreen';
import { RosterScreen } from './app/screens/RosterScreen';
import { TeamProfileScreen } from './app/screens/TeamProfileScreen';
import { PlayerProfileScreen } from './app/screens/PlayerProfileScreen';
import { ScheduleScreen } from './app/screens/ScheduleScreen';
import { RankingsScreen } from './app/screens/RankingsScreen';
import { HistoryScreen } from './app/screens/HistoryScreen';
import { useGameStore } from './app/store/useGameStore';

export function App() {
  const world = useGameStore((state) => state.world);
  const screen = useGameStore((state) => state.screen);

  if (!world) {
    return <HomeScreen />;
  }

  return (
    <Layout>
      {screen === 'dashboard' && <DashboardScreen />}
      {screen === 'roster' && <RosterScreen />}
      {screen === 'teamProfile' && <TeamProfileScreen />}
      {screen === 'playerProfile' && <PlayerProfileScreen />}
      {screen === 'schedule' && <ScheduleScreen />}
      {screen === 'rankings' && <RankingsScreen />}
      {screen === 'history' && <HistoryScreen />}
    </Layout>
  );
}
