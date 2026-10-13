import React, { useState } from "react";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";

interface MessageBoxData {
    message: string,
    button: string,
    onClick: () => void,
    error?: boolean,
    warning?: boolean,
}

/**
 * メッセージボックスを表示します。
 * @returns [オーバーレイ要素, 内容追加関数]
 */
export function useMessageBox(): [React.ReactNode, (data: MessageBoxData) => void] {
    const [queue, setQueue] = useState<MessageBoxData[]>([]);

    const closeMessageBox = () => setQueue(p => p.slice(0, queue.length-1));

    const data = queue.get(-1);
    const view = (
        <Overlay show={data != undefined} setShow={closeMessageBox}>
            <OverlayWindow warning={data?.warning} error={data?.error}>
                <span>{data?.message}</span>
                <button className={data?.error ? "text-fail" : data?.warning ? "text-warn" : String.empty} onClick={() => {
                    data?.onClick();
                    closeMessageBox();
                }}>{data?.button}</button>
            </OverlayWindow>
        </Overlay>
    );

    return [
        view,
        data => setQueue(p => [...p, data])
    ];
}
