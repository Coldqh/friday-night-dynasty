import Dexie, { Table } from 'dexie';
import { GameWorld } from '../core/world/worldTypes';

export interface SaveSlot {
  id: string;
  updatedAt: number;
  world: GameWorld;
}

class FridayNightDb extends Dexie {
  saves!: Table<SaveSlot, string>;

  constructor() {
    super('FridayNightDynastyDb');
    this.version(1).stores({
      saves: 'id, updatedAt'
    });
  }
}

export const db = new FridayNightDb();
