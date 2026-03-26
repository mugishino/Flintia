import { LogicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { ReactNode, useState } from "react";
import { FlintiaWindow } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";

function AbstractTile(props: {children: ReactNode, label: string, onClick?: () => void}) {
    const [moveing, setMoveing] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    return (
        <div
            className="absolute w-1/20 aspect-square bg-blue-600 inline-block -outline-offset-2 outline-videocut-skip-hover hover:outline-2 active:bg-blue-700"
            style={{left: x, top: y, zIndex: moveing ? 1 : 0}}
            onMouseDown={e => {
                if (e.button == 1) setMoveing(true);
            }}
            onMouseUp={e => {
                // ホイールクリック
                if (e.button == 1) {
                    setMoveing(false);
                    // 移動を丸め、グリッドに沿わせる
                    const m = e.currentTarget.clientWidth / 12;
                    const w = (e.currentTarget.clientWidth  + m) / 2;
                    const h = (e.currentTarget.clientHeight + m) / 2;
                    setX(Math.round(x/w)*w);
                    setY(Math.round(y/h)*h);
                }
                // 右クリック
                if (e.button == 2) {}
            }}
            onMouseMove={e => {
                if (!moveing) return;
                setX(x + e.movementX);
                setY(y + e.movementY);
            }}
            onClick={props.onClick}
        >{props.children}</div>
    );
}

function NormalTile(props: {label: string}) {
    return (
        <AbstractTile label={props.label}>
            <span className="absolute bottom-0 text-[16px] ml-1">{props.label}</span>
        </AbstractTile>
    );
}

export default function Launcher() {
    useEffectAsync(async() => {
        const win = await FlintiaWindow.get("launcher");
        if (!win) return;

        // ウィンドウ設定
        await win.setDefaultPosition(new LogicalPosition(0, 0));
        await win.rawWindow.setSize(new PhysicalSize(screen.width, screen.height));
        await win.rawWindow.setPosition(await win.getDefaultPosition() ?? new LogicalPosition(100, 100));

        await win.registerHotkey(true, true, true, false, "A", async() => await win.toggleVisible());
        win.rawWindow.onFocusChanged(({payload}) => {
//            if (!payload) win.hide();
        });
    }, []);

    return (
        <div className="w-full m-12 relative">
            <NormalTile label="A"/>
            <NormalTile label="B"/>
            <NormalTile label="C"/>
            <NormalTile label="D"/>
        </div>
    );
}
