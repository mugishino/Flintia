import React, { useEffect, useState } from "react";

const GRID_SIZE = screen.width / 36;
const MARGIN_SIZE = GRID_SIZE / 12;

export type CellData = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type CellObjProps = {
    /**
     * セルが動かせないようになっているか
     */
    locked?: boolean;
    /**
     * セルの移動が確定時に呼び出されます。
     */
    onMoved?: (x: number, y: number) => void,
    /**
     * 重なっているかを確認する
     * @returns 重なっていればtrue
     */
    isOverlapping?: (celldata: CellData) => boolean,
    /**
     * 右クリックした時に呼び出される
     * @param e onAuxClickのイベント
     */
    onRightClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
} & React.ComponentPropsWithoutRef<"div">;

export function CellObj(props: CellData & CellObjProps) {
    const [moveing, setMoveing] = useState(false);
    const [gridX, setGridX] = useState(props.x);
    const [gridY, setGridY] = useState(props.y);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const {onMoved, locked, isOverlapping, onRightClick, ...rest} = props;

    useEffect(() => {
        if (locked) return;
        // snap
        const size = GRID_SIZE + MARGIN_SIZE;
        const rx = Math.round((x+size*gridX)/size);
        const ry = Math.round((y+size*gridY)/size);
        if (
            // マイナス座標であればキャンセル
            rx >= 0 && ry >= 0
            // 重なっていればキャンセル
            && isOverlapping ? !isOverlapping({x: rx, y: ry, w: props.w, h: props.h}) : true
        ) {
            setGridX(rx);
            setGridY(ry);
        }
        // reset
        setX(0);
        setY(0);

        if (onMoved) onMoved(rx, ry);
    }, [moveing]);

    return (
        <div
            {...rest}
            className="absolute hover:z-10 cursor-default"
            onMouseDown={e => {
                if (e.button == 1 && !locked) {
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
            onAuxClick={e => {
                if (e.button != 2) return;
                if (onRightClick) onRightClick(e);
            }}
            style={{
                left: gridX*(GRID_SIZE+MARGIN_SIZE) + x,
                top: gridY*(GRID_SIZE+MARGIN_SIZE) + y,
                width: (GRID_SIZE*props.w) + (MARGIN_SIZE*(props.w-1)) + "px",
                height: (GRID_SIZE*props.h) + (MARGIN_SIZE*(props.h-1)) + "px",
            }}
        >{props.children}</div>
    );
}
