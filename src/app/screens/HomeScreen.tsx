import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GAME_VERSION_LABEL } from '../version';
import { useGameStore } from '../store/useGameStore';

export function HomeScreen() {
  const newWorld = useGameStore((state) => state.newWorld);
  const continueWorld = useGameStore((state) => state.continueWorld);
  const error = useGameStore((state) => state.error);

  return (
    <div className="home-screen">
      <div className="home-title">
        <div className="eyebrow">живая футбольная вселенная / {GAME_VERSION_LABEL}</div>
        <h1>Friday Night Dynasty</h1>
        <p>
          Школьный футбол, маленькие города, сезоны, выпускники, рекорды и карьеры, которые продолжаются после последнего школьного матча.
        </p>
      </div>

      <Card>
        <div className="button-stack">
          <Button onClick={newWorld}>Новый мир</Button>
          <Button variant="ghost" onClick={continueWorld}>
            Продолжить
          </Button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </Card>
    </div>
  );
}
