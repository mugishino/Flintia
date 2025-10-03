import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile } from "~/util/path";
import * as AutoStart from "@tauri-apps/plugin-autostart";
import { useEffect, useState } from "react";
import Config from "~/Config";
import { Flintia, HotkeyMainKey } from "~/Flintia";
import Section from "~/components/Section";
import Setting from "~/components/Setting";
import ToggleSwitch from "~/components/ToggleSwitch";
import { useEffectAsync } from "~/hooks/useEffectAsync";

export default function System() {
    const [autostart, setAutostart] = useState(false);

    const [shift, setShift] = useState(true);
    const [ctrl, setCtrl] = useState(true);
    const [alt, setAlt] = useState(true);
    const [win, setWin] = useState(false);
    const [waitKey, setWaitKey] = useState(false);
    const [key, setKey] = useState<string>("Q");

    const [hotkeyOk, setHotkeyOk] = useState(true);

    useEffectAsync(async () => {
        setAutostart(await AutoStart.isEnabled());

        const config = await Config.load();
        setShift(config.hotkey_shift);
        setCtrl (config.hotkey_ctrl );
        setAlt  (config.hotkey_alt  );
        setWin  (config.hotkey_win  );
        setKey  (config.hotkey_main );
    }, []);

    useEffect(() => {
        Flintia.registerHotkey(shift, ctrl, alt, win, key as HotkeyMainKey).then(isError => setHotkeyOk(isError));
        Config.load().then(config => {
            config.hotkey_shift = shift;
            config.hotkey_ctrl  = ctrl ;
            config.hotkey_alt   = alt  ;
            config.hotkey_win   = win  ;
            config.hotkey_main  = key as HotkeyMainKey;
            config.save();
        });
    }, [shift, ctrl, alt, win, key]);

    return (
        <>
            <Section title="Settings">
                <Setting title="AutoLaunch">
                    <ToggleSwitch value={autostart} onChange={async v => {
                        await (v ? AutoStart.enable() : AutoStart.disable());
                        setAutostart(v);
                    }}/>
                </Setting>
                {/* StrictMode時にのみ初回表示時にFailedが出ます */}
                <Setting title={"Hotkey" + (hotkeyOk ? String.empty : " - Failed")}>
                    <div className="flex">
                        <ToggleSwitch label="Shift" value={shift} onChange={() => setShift(!shift)}/>
                        <ToggleSwitch label="Ctrl"  value={ctrl}  onChange={() => setCtrl (!ctrl )}/>
                        <ToggleSwitch label="ALT"   value={alt}   onChange={() => setAlt  (!alt  )}/>
                        <ToggleSwitch label="Win"   value={win}   onChange={() => setWin  (!win  )}/>
                        <button onClick={() => {
                            setWaitKey(!waitKey);
                            if (!waitKey) {
                                document.addEventListener("keydown", (e: KeyboardEvent) => {
                                    const key = e.key.toUpperCase();
                                    if (!"ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(key)) return;
                                    setKey(key);
                                    setWaitKey(false);
                                }, {once: true});
                            }
                        }}>{waitKey ? "..." : key}</button>
                    </div>
                </Setting>
                <Setting title="Appdata directory">
                    <button onClick={() => getAppdataDirFile(String.empty).then(dir => WInvoke.openExplorer(dir))}>Open Explorer</button>
                </Setting>
            </Section>
        </>
    );
}
