import { ReactNode, useEffect, useState } from "react";

const GRID_SIZE = screen.width / 36;
const MARGIN_SIZE = GRID_SIZE / 12;

export type CellData = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export function CellObj(props: {
    data: CellData,
    onClick?: () => void,
    movable: boolean,
    onMoved?: (x: number, y: number) => void,
    children?: ReactNode,
}) {
    const [moveing, setMoveing] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const v = props.data;

    useEffect(() => {
        // snap
        const size = GRID_SIZE + MARGIN_SIZE;
        const rx = Math.round((x+size*v.x)/size);
        const ry = Math.round((y+size*v.y)/size);
        // マイナス座標であればキャンセル
        if (rx >= 0 && ry >= 0) {
            v.x = rx;
            v.y = ry;
        }
        // reset
        setX(0);
        setY(0);

        if (props.onMoved) props.onMoved(v.x, v.y);
    }, [moveing]);

    return (
        <div
            className="absolute hover:z-10 cursor-default"
            onClick={props.onClick}
            onMouseDown={e => {
                if (e.button == 1 && props.movable) {
                    setMoveing(!moveing);
                    e.preventDefault();
                }
            }}
            onMouseLeave={() => {
                if (moveing) setMoveing(false);
            }}
            onMouseMove={e => {
                if (!moveing) return;
                setX(x + e.movementX);
                setY(y + e.movementY);
            }}
            style={{
                left: v.x*(GRID_SIZE+MARGIN_SIZE) + x,
                top: v.y*(GRID_SIZE+MARGIN_SIZE) + y,
                width: (GRID_SIZE*v.w) + (MARGIN_SIZE*(v.w-1)) + "px",
                height: (GRID_SIZE*v.h) + (MARGIN_SIZE*(v.h-1)) + "px",
            }}
        >{props.children}</div>
    );
}
