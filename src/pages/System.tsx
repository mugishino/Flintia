import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile, Paths } from "~/util/path";
import * as AutoStart from "@tauri-apps/plugin-autostart";
import { ReactNode, useEffect, useState } from "react";
import Config from "~/Config";
import { Flintia, HotkeyMainKey } from "~/Flintia";
import Section from "~/components/Section";
import Setting from "~/components/Setting";
import ToggleSwitch from "~/components/ToggleSwitch";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { startInterval } from "~/util/util";
import { Command } from "@tauri-apps/plugin-shell";
import { openPath, openUrl } from "@tauri-apps/plugin-opener";
import { readDir } from "@tauri-apps/plugin-fs";
import ReloadTheme from "~/Theme";
import Overlay from "~/components/Overlay";

const ALL_DISK_INFO = await WInvoke.getAllDiskInfo();
const GB = 1024*1024*1024;

const NVIDIA = await Command.create("nvidia-smi", ["--query-gpu=driver_version", "--format=noheader"]).execute().then(v => v.stdout).catch(() => undefined);
const CUDA   = await Command.create("nvcc", ["--version"]).execute().then(v => v.stdout).catch(() => undefined);

const THEMES = await readDir(await getAppdataDirFile("themes/"));

export default function System() {
    const [autostart, setAutostart] = useState(false);

    const [shift, setShift] = useState(true);
    const [ctrl, setCtrl] = useState(true);
    const [alt, setAlt] = useState(true);
    const [win, setWin] = useState(false);
    const [waitKey, setWaitKey] = useState(false);
    const [key, setKey] = useState<string>("Q");

    const [hotkeyOk, setHotkeyOk] = useState(true);

    const [theme, setTheme] = useState<string>("Default_Dark");

    const [uptime, setUptime] = useState(0);

    const [hotfixOverlay, setHotfixOverlay] = useState(false);
    const [hotfixData, setHotfixData] = useState<ReactNode>(undefined);

    useEffectAsync(async () => {
        setAutostart(await AutoStart.isEnabled());

        const config = await Config.load();
        setShift(config.hotkey_shift);
        setCtrl (config.hotkey_ctrl );
        setAlt  (config.hotkey_alt  );
        setWin  (config.hotkey_win  );
        setKey  (config.hotkey_main );

        setTheme(config.theme);

        startInterval(async () => WInvoke.getSystemUptime().then(v => setUptime(v)), 1000);
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
            <Section title="System Info">
                <Setting title="システム起動時間">{`${(uptime/86400).toInt()}:${(uptime%86400/3600).toInt().toStringZero(2)}:${(uptime%3600/60).toInt().toStringZero(2)}:${(uptime%60).toInt().toStringZero(2)}`}</Setting>
                <Setting title="NVIDIA Driver Version">{NVIDIA}</Setting>
                <Setting title="CUDA Version">{CUDA?.split(/[\n,]/)[4]}</Setting>
            </Section>
            <Section title="Disk Halfway Status" toolTip="ディスク容量の半分まで残り何GBかを示します">
                {ALL_DISK_INFO.map(disk => <Setting title={disk.name} key={disk.name}>{Math.floorEx((disk.available_space - (disk.total_size/2))/GB, 1)}GB</Setting>)}
            </Section>
            <Section title="Other">
                <button onClick={async() => {
                    setHotfixOverlay(true);
                    // 読み込み済みだったらReturn
                    if (hotfixData != null) return;
                    const hotfix = await WInvoke.getWindowsHotfix()
                    setHotfixData(
                        hotfix.map(q =>
                            <button onClick={async() => await openUrl(`https://www.google.com/search?q=${q.HotFixID}`)}>{q.HotFixID}</button>
                        )
                    );
                }}>Show Windows Hotfix List</button>
                <Overlay show={hotfixOverlay} setShow={setHotfixOverlay}>
                    <div className="flex flex-col w-1/2 mx-auto my-auto" onClick={e => e.stopPropagation()}>
                        {hotfixData ?? "読み込み中..."}
                    </div>
                </Overlay>
            </Section>
        </>
    );
}
