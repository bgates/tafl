import { Side } from "./types";

const randFrom = (as: Array<string>) =>
  as[Math.floor(Math.random() * as.length)];
export const randRoom = () =>
  `${randFrom(names)}s-${randFrom(items)}-${Math.floor(Math.random() * 1000)}`;

export const randSide: () => Side = () =>
  Math.random() > 0.5 ? "attacker" : "defender";

const names = [
  "Thor",
  "Odin",
  "Loki",
  "Sven",
  "Bjorn",
  "Frida",
  "Helga",
  "Hilda",
  "Sigrid",
];
const items = [
  "Hammer",
  "Beard",
  "Helmet",
  "Sword",
  "Shield",
  "Spear",
  "Steed",
];
