import { UnitSystem } from './enums';

export interface LocalStorage {

  distance: {
    [x: number]: number
  }
  metric: UnitSystem
}