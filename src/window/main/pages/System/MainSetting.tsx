import { DirEntry, readDir } from "@tauri-apps/plugin-fs";
import * as AutoStart from "@tauri-apps/plugin-autostart";
import { useEffect, useState } from "react";
import Setting from "~/components/Setting";
import ToggleSwitch from "~/components/ToggleSwitch";
import Config from "~/Config";
import { FlintiaWindow, HotkeyMainKey } from "~/Flintia";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";
import ReloadTheme from "~/Theme";
import { openPath } from "@tauri-apps/plugin-opener";
import Section from "~/components/Section";

export default function MainSetting() {
    const [config, setConfig] = useState<Config|undefined>(undefined);

    const [THEMES, setThemes] = useState<DirEntry[]>([]);

    const [autostart, setAutostart] = useState(false);

    const [shift, setShift] = useState(true);
    const [ctrl, setCtrl] = useState(true);
    const [alt, setAlt] = useState(true);
    const [win, setWin] = useState(false);
    const [waitKey, setWaitKey] = useState(false);
    const [key, setKey] = useState<string>("Q");

    const [hotkeyOk, setHotkeyOk] = useState(true);

    const [theme, setTheme] = useState<string>("Default_Dark");

    useEffectAsync(async () => {
        setThemes(await readDir(await getAppdataDirFile("themes/")));
        setAutostart(await AutoStart.isEnabled());
        setConfig(await Config.load());
    }, []);

    useEffect(() => {
        if (config == undefined) return;
        setShift(config.hotkey_shift);
        setCtrl (config.hotkey_ctrl );
        setAlt  (config.hotkey_alt  );
        setWin  (config.hotkey_win  );
        setKey  (config.hotkey_main );

        setTheme(config.theme);
    }, [config]);

    useEffectAsync(async() => {
        if (config == undefined) return;
        const flintia = await FlintiaWindow.getCurrentWindow();
        flintia.registerHotkey(shift, ctrl, alt, win, key as HotkeyMainKey, () => flintia.toggleVisible()).then(isError => setHotkeyOk(isError));
        Config.load().then(config => {
            config.hotkey_shift = shift;
            config.hotkey_ctrl  = ctrl ;
            config.hotkey_alt   = alt  ;
            config.hotkey_win   = win  ;
            config.hotkey_main  = key as HotkeyMainKey;
            config.save();
        });
    }, [shift, ctrl, alt, win, key]);

    return(
        <Section title="Main Settings">
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
                <button onClick={() => getAppdataDirFile(String.empty).then(dir => openPath(dir))}>Open Explorer</button>
            </Setting>
            <Setting title="Theme" hide={true/* テーマ設定を無効化 */}>
                <select value={theme} onChange={async v => {
                    // useEffectで書くとページ表示時にテーマが再読み込みされるのを回避するためにこちらに記述
                    const value = v.currentTarget.value;
                    setTheme(value);

                    const config = await Config.load();
                    config.theme = value;
                    await config.save();
                    ReloadTheme();
                }}>
                    <option value={"Default_Dark"}>Default</option>
                    {
                        THEMES.map(v => {
                            if (!v.isFile) return;
                            const basename = Paths.getBasename(v.name);
                            const splitExt = Paths.splitExt(basename);
                            if (splitExt.ext != "css") return;
                            return <option key={basename} value={basename}>{splitExt.name}</option>;
                        })
                    }
                </select>
            </Setting>
        </Section>
    );
}
