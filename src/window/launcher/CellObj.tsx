import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { IntVector2 } from "~/util/clazz";
import { parseMouseButtons } from "~/util/util";

export const GRID_SIZE = screen.width / 43;
export const MARGIN_SIZE = GRID_SIZE / 12;
const CELL_DRAG_THRESHOLD = GRID_SIZE / 3;

/**
 * 複数のセルのサイズを取得します。
 * @param length セルの個数
 * @returns サイズ
 */
export function getCellSize(length: number=1) {
    return (GRID_SIZE + MARGIN_SIZE) * length + MARGIN_SIZE;
}

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
    /**
     * ホイールクリックした時に呼び出される
     * @param e onWheelClickのイベント
     */
    onWheelClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
} & React.ComponentPropsWithoutRef<"div">;

export function CellObj(props: CellData & CellObjProps) {
    const [moveing, setMoveing] = useState(false);
    const [gridX, setGridX] = useState(props.x);
    const [gridY, setGridY] = useState(props.y);
    const [moveX, setMoveX] = useState(0);
    const [moveY, setMoveY] = useState(0);

    const [downOrigin, setDownOrigin] = useState<IntVector2|undefined>(undefined);

    const {onMoved, locked, isOverlapping, onRightClick, onWheelClick, className, onClick, ...rest} = props;

    useEffect(() => {
        if (locked || moveing) return;
        // snap
        const size = GRID_SIZE + MARGIN_SIZE;
        const rx = Math.round((moveX+size*gridX)/size);
        const ry = Math.round((moveY+size*gridY)/size);

        const isMinus = rx < 0 || ry < 0;
        const isOverlap = isOverlapping ? isOverlapping({x: rx, y: ry, w: props.w, h: props.h}) : true;
        if (!isMinus && !isOverlap) {
            setGridX(rx);
            setGridY(ry);
        }
        // reset
        setMoveX(0);
        setMoveY(0);

        if (onMoved) onMoved(rx, ry);
    }, [moveing]);

    function moveCell(e: React.MouseEvent) {
        setMoveing(true);
        // セル中央をマウスに持っていく
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width/2;
        const centerY = rect.top  + rect.height/2;
        setMoveX(e.clientX - centerX + moveX + e.movementX);
        setMoveY(e.clientY - centerY + moveY + e.movementY);
    }

    const cellX = gridX * (GRID_SIZE + MARGIN_SIZE);
    const cellY = gridY * (GRID_SIZE + MARGIN_SIZE);

    return (
        <div
            {...rest}
            className={twMerge("absolute hover:z-10 cursor-default", className)}
            onMouseDown={e => {
                if (e.button == 0) setDownOrigin(new IntVector2(e.pageX, e.pageY));
            }}
            onMouseUp={e => {
                setMoveing(false);
                // 単純にonClickでやるとセル移動時に離したとき反応してしまうためこちらでやる
                // e.button == 0で左クリックの変化を取得
                if (e.button == 0 && !moveing && onClick) onClick(e);
            }}
            onMouseLeave={e => {
                const buttons = parseMouseButtons(e);
                if (buttons.left && !moveing) {
                    moveCell(e);
                }
            }}
            onMouseMove={e => {
                const buttons = parseMouseButtons(e);
                // 左クリックしながら動かした場合、原点から一定距離離れればmoveing状態にする
                if (buttons.left && downOrigin && downOrigin.getDistanceFromXY(e.pageX, e.pageY) > CELL_DRAG_THRESHOLD && !moveing) {
                    moveCell(e);
                }

                // セルの移動
                if (!moveing) return;
                moveCell(e);
            }}
            onAuxClick={e => {
                if (e.button == 2 && onRightClick) onRightClick(e);
                if (e.button == 1 && onWheelClick) onWheelClick(e);
            }}
            style={{
                left: cellX + moveX,
                top: cellY + moveY,
                width: (GRID_SIZE*props.w) + (MARGIN_SIZE*(props.w-1)) + "px",
                height: (GRID_SIZE*props.h) + (MARGIN_SIZE*(props.h-1)) + "px",
            }}
        >{props.children}</div>
    );
}
