import { db } from './db';
import { GameWorld } from '../core/world/worldTypes';

const MAIN_SAVE_ID = 'main';

export async function saveWorld(world: GameWorld): Promise<void> {
  await db.saves.put({ id: MAIN_SAVE_ID, updatedAt: Date.now(), world });
}

export async function loadLatestWorld(): Promise<GameWorld | null> {
  const save = await db.saves.get(MAIN_SAVE_ID);
  return save?.world ?? null;
}
