import { convertFileSrc } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useRef, useState } from "react";
import SVGButton from "~/components/SVGButton";
import { Flintia } from "~/Flintia";
import useOverlay from "~/hooks/useOverlay";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";

function secondToTime(sec: number) {
    const h = (sec/3600).toInt().toStringZero(2);
    const m = (sec/60).toInt().toStringZero(2);
    const s = ("0"+(sec%60).toFixed(1)).slice(-4);
    return `${h}:${m}:${s}`;
}

function commandBuild(inputfile: string, outputFile: string, startTime: number, endTime: number) {
    return `ffmpeg -i "${inputfile}" -c copy -ss ${startTime} -to ${endTime} "${outputFile}"`;
}

export default function VideoCut() {
    const [Overlay, showOverlay] = useOverlay();

    // core
    const [inputFile, setInputFile] = useState<string|null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // video data
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // edit data
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    // overlay
    const [outputFile, setOutputFile] = useState<string|null>(null);
    const [copied, setCopied] = useState(false);



    function onPlay() {
        if (videoRef.current == null) return;
        setCurrentTime(videoRef.current.currentTime);
        // 動画再生時にのみ、次の描画フレームでシークバー更新するように
        if (!videoRef.current.paused) requestAnimationFrame(onPlay);
    }

    function playPauseToggle() {
        if (videoRef.current == null) return;
        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }



    return (
        <div className="flex flex-col h-full">
            <button className="border-0 border-b-1" onClick={async () => {
                const result = await open({
                    directory: false,
                    title: "Select Video",
                    multiple: false,
                    filters: [{extensions: ["mp4", "webm", "mov", "mkv"], name: String.empty}],
                });
                await Flintia.show();
                if (result) setInputFile(result);
            }}>{Paths.getBasename(inputFile ?? "Browse...")}</button>
            <video
                ref={videoRef}
                className="min-h-0 grow"
                src={inputFile == null ? undefined : convertFileSrc(inputFile)}
                onClick={playPauseToggle}
                onPlay={onPlay}
                onLoadedMetadata={v => {
                    const time = v.currentTarget.duration;
                    setDuration(time);
                    setEndTime(time);
                }
            }/>
            <div className="flex flex-row">
                <SVGButton className="h-8" src="play_pause.svg" onClick={playPauseToggle}/>
                <span className="my-auto mx-1">{secondToTime(currentTime)}</span>
                <input className="p-0 mx-1" type="range" min={0} max={duration} step={0.1} value={currentTime} onChange={v => {
                    if (videoRef.current == null) return;
                    setCurrentTime(v.currentTarget.valueAsNumber);
                    videoRef.current.currentTime = v.currentTarget.valueAsNumber;
                }}/>
            </div>
            <div className="flex flex-row">
                <button disabled={endTime <= currentTime} onClick={() => setStartTime(currentTime)}>{`START - ${secondToTime(startTime)}`}</button>
                <button disabled={startTime >= currentTime} onClick={() => setEndTime(currentTime)}>{`END - ${secondToTime(endTime)}`}</button>
                <div className="grow min-w-1/10"/>
                <button disabled={inputFile == null} onClick={() => showOverlay()}>Go to output</button>
            </div>
            <Overlay>
                <div className="m-auto p-8 w-1/3 h-1/3 bg-bg border-1 justify-center border-app-edge flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={async () => {
                        const result = await save({
                            title: "save",
                            filters: [{extensions: [Paths.splitExt(inputFile!).ext], name: ""}]
                        });
                        if (result != null) setOutputFile(result);
                        await Flintia.show();
                    }}>Browse output file</button>
                    <span>{outputFile ?? "No output file selected"}</span>
                    <hr className="mb-3"/>
                    <button onClick={() => {
                        const cmd = commandBuild(
                            inputFile ?? "i.",
                            outputFile ?? "o.",
                            Math.floorEx(startTime, 1),
                            Math.floorEx(endTime, 1)
                        );
                        Clipboards.copyText(cmd);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1000);
                    }}>{copied ? "Copied!" : "Copy FFmpeg Command"}</button>
                    <button disabled>Run FFmpeg | 未実装</button>
                </div>
            </Overlay>
        </div>
    );
}
