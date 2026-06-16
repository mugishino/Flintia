import { useState } from "react";
import { Line } from "~/components/Line";
import { OverlayWindow } from "~/components/OverlayWindow";
import { Section } from "~/components/Section";
import { Setting } from "~/components/Setting";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { WInvoke } from "~/InvokeWrapper";

const ALL_DISK_INFO = await WInvoke.getAllDiskInfo();
const GB = 1024**3;

type StatusLevel = "SAFE" | "NORMAL" | "WARN" | "ERROR" | "CRITICAL";
const LEVEL_DATA = new Map<StatusLevel, {color: string, waf: string, tooltip: string}>([
    ["SAFE"     , {color: "text-safe"       , waf: "1.0~1.1", tooltip: "とても安全です。"}],
    ["NORMAL"   , {color: "text-safe"       , waf: "1.1~1.2", tooltip: "安全です。"}],
    ["WARN"     , {color: "text-warn"       , waf: "1.2~2.0", tooltip: "注意域です。不要ファイルの整理を推奨します。"}],
    ["ERROR"    , {color: "text-error"      , waf: "2.5~5.0", tooltip: "危険です。ストレージ寿命を著しく縮めます。"}],
    ["CRITICAL" , {color: "text-purple-600" , waf: "5.0~"   , tooltip: "致命的です。高負荷による早期故障のリスクが高いです。直ちに空き容量を確保してください。"}],
]);

export function DiskStatus() {
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();
    const [viewType, setViewType] = useState(0);

    function openWafInfo() {
        setStaticOverlay(
            <OverlayWindow>
                <h1>WAFとは？</h1>
                <Line/>
                <span>WAF(Write Amplification Factor)はSSDへの書き込み効率です。</span>
                <span>1.0に近ければ近いほど書き込み効率が良く、GC効率も高いです。</span>
                <span>値が高いと書き込み速度の低下、ストレージ寿命の減少が発生します。</span>
                <Line/>
                <div className="text-[0.7rem] flex flex-row gap-4 justify-center">
                    <span className="text-safe">超安全: 60%未満</span>
                    <span className="text-safe">安全: 75%未満</span>
                    <span className="text-warn">注意: 85%未満</span>
                    <span className="text-error">危険: 95%未満</span>
                    <span className="text-purple-600">致命的: 96%以上</span>
                </div>
            </OverlayWindow>
        );
    }

    return (
        <Section title="Disk Status">
            {ALL_DISK_INFO.map(disk => {
                const usingPercent = 100 - Math.floorEx((disk.available_space / disk.total_size)*100, 1);
                const level: StatusLevel = (() => {
                    if (usingPercent < 60) return "SAFE";
                    if (usingPercent < 75) return "NORMAL";
                    if (usingPercent < 85) return "WARN";
                    if (usingPercent < 95) return "ERROR";
                    return "CRITICAL";
                })();
                const data = LEVEL_DATA.get(level);

                return (
                    <Setting title={disk.name} key={disk.name} childClassName={data?.color}>
                        <span title={data?.tooltip + "\nWAF目安: "+data?.waf} onAuxClick={openWafInfo} onClick={() => setViewType(viewType+1)} className="cursor-pointer">
                            {[
                                `${usingPercent}% 使用中`,
                                `残り${Math.floorEx(disk.available_space / GB, 1)}GB`,
                                `${Math.floorEx((disk.total_size - disk.available_space)/GB, 1)}GB 使用中`
                            ].get(viewType % 3)}
                        </span>
                    </Setting>
                );
            })}
            {staticOverlay}
        </Section>
    );
}
