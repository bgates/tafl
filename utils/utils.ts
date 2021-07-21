import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { Side } from "./types";

const hexChars = "0123456789abcdef";
export const randRoom = () =>
  pipe(
    A.range(1, 16),
    A.map((n) => hexChars[Math.floor(Math.random() * 16)]),
    A.reduce("", (acc, curr) => acc + curr)
  );

export const randSide: () => Side = () =>
  Math.random() > 0.5 ? "attacker" : "defender";
