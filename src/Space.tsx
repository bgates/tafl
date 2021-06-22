import React from "react";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as M from "pattern-matching-ts/lib/match";
import { Piece } from "./types";
export const Space = ({
  available,
  occupant,
  isCastle,
  onHover,
  onLeave,
}: {
  available: boolean;
  occupant: O.Option<Piece>;
  isCastle: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => (
  <div
    className={
      isCastle
        ? "bg-red-500 text-white border"
        : available
        ? "bg-blue-200 border"
        : "border"
    }
    onMouseEnter={pipe(
      occupant,
      O.fold(
        () => constVoid,
        () => onHover
      )
    )}
    onMouseLeave={onLeave}
  >
    {pipe(
      occupant,
      O.fold(
        () => <div className="w-8 h-8"></div>,
        flow(
          M.match({
            king: () => (
              <div className="w-8 h-8 grid display-content-center">K</div>
            ),
            swede: () => (
              <div className="w-8 h-8 grid display-content-center">S</div>
            ),
            muscovite: () => (
              <div className="w-8 h-8 grid display-content-center">M</div>
            ),
            _: () => <div />,
          })
        )
      )
    )}
  </div>
);
