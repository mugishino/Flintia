import { Section, Setting, ToggleSwitch } from "~/Components";
import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile, useEffectAsync } from "~/util";
import * as AutoStart from "@tauri-apps/plugin-autostart";
import { useState } from "react";

export default function System() {
    const [autostart, setAutostart] = useState(false);

    useEffectAsync(async () => {
        setAutostart(await AutoStart.isEnabled());
    }, []);

    return (
        <>
            <Section title="Settings">
                <Setting title="AutoLaunch">
                    <ToggleSwitch value={autostart} onChange={async v => {
                        await (v ? AutoStart.enable() : AutoStart.disable());
                        setAutostart(v);
                    }}/>
                </Setting>
            </Section>
            <Section title="System">
                <button onClick={() => getAppdataDirFile(String.empty).then(dir => WInvoke.openExplorer(dir))}>Open AppData directory</button>
            </Section>
        </>
    );
}
