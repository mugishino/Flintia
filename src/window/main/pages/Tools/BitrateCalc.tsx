import { useState } from "react";
import Setting from "~/components/Setting";

export default function BitrateCalc(props: {
    duration?: number,
}) {
    const [stateDuration, setDuration] = useState(0);
    const [targetSize, setTargetSize] = useState(10);
    const [audioBitrate, setAudioBitrate] = useState(192);

    const duration = props.duration ?? stateDuration;

    // 映像Kbps = (目標MiB容量 x 8192 / 秒数) - 音声Kbps
    const videoBitrate = (targetSize * 8192 / duration) - audioBitrate;

    return (
        <>
            <Setting title="動画長(秒)">
                <input type="number" disabled={!!props.duration} min={0} value={props.duration ?? duration} onChange={v => setDuration(v.currentTarget.valueAsNumber.orDefault(0))}/>
            </Setting>
            <Setting title="目標容量(MB)">
                <input type="number" min={0} value={targetSize} onChange={v => setTargetSize(v.currentTarget.valueAsNumber.orDefault(0))}/>
            </Setting>
            <Setting title="音声ビットレート(kbps)">
                <input type="number" min={1} value={audioBitrate} onChange={v => setAudioBitrate(v.currentTarget.valueAsNumber.orDefault(0))}/>
            </Setting>
            <button>映像ビットレート: {Math.floorEx(videoBitrate, 1)} Kbps</button>
        </>
    );
}
