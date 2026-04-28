import { useState } from "react";
import { Setting } from "~/components/Setting";

export function BitrateCalc(props: {
    duration?: number,
}) {
    const [stateDuration, setDuration] = useState(0);
    const [targetSize, setTargetSize] = useState(10);
    const [audioBitrate, setAudioBitrate] = useState(192);

    const [durationFocus, setDurationFocus] = useState(false);

    const duration = props.duration ?? stateDuration;

    // render
    const hour = Math.floor(duration / 3600);
    const minute = Math.floor((duration % 3600) / 60);
    const second = duration % 60;
    const timeText: string[] = [];
    if (hour   > 0) timeText.push(`${hour}時間`);
    if (minute > 0) timeText.push(`${minute}分`);
    if (second > 0) timeText.push(`${second}秒`);

    // 映像Kbps = (目標MiB容量 x 8192 / 秒数) - 音声Kbps
    const videoBitrate = (targetSize * 8192 / duration) - audioBitrate;

    return (
        <>
            <Setting title="動画長(秒)">
                <input
                    type={durationFocus ? "number" : "text"}
                    disabled={!!props.duration}
                    min={0}
                    value={durationFocus ? (props.duration ?? duration) : timeText.join(String.space)}
                    onChange={v => setDuration(v.currentTarget.valueAsNumber.orDefault(0))}
                    onFocus={() => setDurationFocus(true)}
                    onBlur={() => setDurationFocus(false)}
                    onKeyDown={e => {
                        const key = e.key.toLowerCase();
                        if (key == "arrowdown" || key == "arrowup") {
                            const num = key == "arrowup" ? 1 : -1;
                            const step = e.shiftKey ? 60*60 : e.ctrlKey ? 60 : 1;
                            setDuration(v => (v + (num * step)).keepRange(0, Infinity));
                            e.preventDefault();
                        }
                    }
                }/>
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
