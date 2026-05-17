import { Layout } from './app/components/Layout';
import { HomeScreen } from './app/screens/HomeScreen';
import { DashboardScreen } from './app/screens/DashboardScreen';
import { RosterScreen } from './app/screens/RosterScreen';
import { TeamProfileScreen } from './app/screens/TeamProfileScreen';
import { CollegeTeamProfileScreen } from './app/screens/CollegeTeamProfileScreen';
import { PlayerProfileScreen } from './app/screens/PlayerProfileScreen';
import { FavoritesScreen } from './app/screens/FavoritesScreen';
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
      {screen === 'collegeTeamProfile' && <CollegeTeamProfileScreen />}
      {screen === 'playerProfile' && <PlayerProfileScreen />}
      {screen === 'favorites' && <FavoritesScreen />}
      {screen === 'schedule' && <ScheduleScreen />}
      {screen === 'rankings' && <RankingsScreen />}
      {screen === 'history' && <HistoryScreen />}
    </Layout>
  );
}
