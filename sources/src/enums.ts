export enum Units {
  CENTIMETER = 'cm',
  METER = 'm',  
  KILOMETR = 'km',
  INCH = 'in',
  FOOT = 'ft',
  YARD = 'yd',
  MILE = 'ml',
}

export interface Store {
  path: number;
  unit: Units;
}