import { constVoid, flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as M from "pattern-matching-ts/lib/match";
import { useMultiDrag, useMultiDrop } from "react-dnd-multi-backend";
import { Piece, Position, Side } from "types";

const GenericPiece = ({
  row,
  col,
  type,
  depiction,
}: {
  row: number;
  col: number;
  type: string;
  depiction: string;
}) =>
  pipe(
    useMultiDrag({
      item: { type, row, col },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    ([
      [{ isDragging }, drag],
      {
        html5: [html5Drag],
        touch: [touchDrag],
      },
    ]) => (
      <div
        ref={drag}
        className={`w-8 h-8 grid display-content-center opacity-${
          isDragging ? 25 : 100
        }`}
      >
        {depiction}
      </div>
    )
  );

const Swede = ({ row, col }: { row: number; col: number }) => (
  <GenericPiece row={row} col={col} type="swede" depiction="S" />
);
const Muscovite = ({ row, col }: { row: number; col: number }) => (
  <GenericPiece row={row} col={col} type="muscovite" depiction="M" />
);
const King = ({ row, col }: { row: number; col: number }) => (
  <GenericPiece row={row} col={col} type="king" depiction="K" />
);
export const Space = ({
  available,
  occupant,
  isCastle,
  onHover,
  onLeave,
  onMove,
  row,
  col,
  currentPlayer,
}: {
  available: boolean;
  occupant: O.Option<Piece>;
  isCastle: boolean;
  row: number;
  col: number;
  currentPlayer: Side;
  onHover: () => void;
  onLeave: () => void;
  onMove: (from: Position, to: Position) => void;
}) => {
  const [
    [_props, drop],
    {
      html5: [],
    },
  ] = useMultiDrop({
    accept: currentPlayer === "attacker" ? "muscovite" : ["swede", "king"],
    drop: (_, monitor) => {
      onMove(monitor.getItem(), { row, col });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  return (
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
          () => <div className="w-8 h-8" ref={drop}></div>,
          flow(
            M.match({
              king: () => <King row={row} col={col} />,
              swede: () => <Swede row={row} col={col} />,
              muscovite: () => <Muscovite row={row} col={col} />,
              _: () => <div />,
            })
          )
        )
      )}
    </div>
  );
};
