import { Command } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { Section } from "~/components/Section";
import { Setting } from "~/components/Setting";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { WInvoke } from "~/InvokeWrapper";
import { startInterval } from "~/util/util";

const NVIDIA = await Command.create("nvidia-smi", ["--query-gpu=driver_version", "--format=noheader"]).execute().then(v => v.stdout).catch(() => undefined);
const CUDA   = await Command.create("nvcc", ["--version"]).execute().then(v => v.stdout).catch(() => undefined);

export function SystemInfo() {
    const [uptime, setUptime] = useState(0);

    useEffectAsync(async () => {
        // 起動時間とシステム時間の誤差を取得し、その後は誤差とシステム時間から起動時間を精度良く逆算
        const time = await WInvoke.getSystemUptime() * 1000;
        const timeError = Date.now() - time;

        startInterval(async () => {
            setUptime((Date.now() - timeError) / 1000)
        }, 1000);
    }, []);

    return (
        <Section title="System Info">
            <Setting title="システム起動時間">{`${(uptime/86400).toInt()}:${(uptime%86400/3600).toInt().toStringZero(2)}:${(uptime%3600/60).toInt().toStringZero(2)}:${(uptime%60).toInt().toStringZero(2)}`}</Setting>
            <Setting title="NVIDIA Driver Version">{NVIDIA}</Setting>
            <Setting title="CUDA Version">{CUDA?.split(/[\n,]/)[4]}</Setting>
        </Section>
    );
}
