import { Side } from "./types";

export type Player = {
  name: string;
  roomId: string;
  id: string;
  side: Side;
};
export const makePlayer = (
  name: string,
  roomId: string,
  id: string,
  side: Side
): Player => ({
  name,
  roomId,
  id,
  side,
});
