import { convertFileSrc } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useRef, useState } from "react";
import SVGButton from "~/components/SVGButton";
import { CommandExists, DefaultFileName } from "~/Data";
import { Flintia } from "~/Flintia";
import useOverlay, { useStaticOverlay } from "~/hooks/useOverlay";
import { WInvoke } from "~/InvokeWrapper";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";
import { Nullable } from "~/util/type";

function secondToTime(sec: number) {
    const h = (sec/3600).toInt().toStringZero(2);
    const m = (sec/60).toInt().toStringZero(2);
    const s = ("0"+(sec%60).toFixed(1)).slice(-4);
    return `${h}:${m}:${s}`;
}

/**
 * FFmpegのコマンドを生成します。
 * @param inputFile 入力ファイル. undefinedの場合デフォルトのファイル名
 * @param outputFile 出力ファイル. undefinedの場合デフォルトのファイル名
 * @param startTime 開始時間(自動で小数第一位以下切り捨て)
 * @param endTime 終了時間(自動で小数第一位以下切り捨て)
 * @param escape ファイル名をエスケープするか(コマンドコピー用)
 * @returns 生成されたコマンドのデータ
 */
function commandBuild(inputFile: Nullable<string>, outputFile: Nullable<string>, startTime: number, endTime: number, escape: boolean) {
    const i = inputFile ?? DefaultFileName.Input;
    const o = outputFile ?? DefaultFileName.Output;
    const ss = Math.floorEx(startTime, 1).toString();
    const to = Math.floorEx(endTime, 1).toString();

    const alias = "ffmpeg";
    const args = [
        "-i", escape ? `"${i}"` : i,
        "-c", "copy",
        "-ss", ss,
        "-to", to,
        escape ? `"${o}"` : o
    ];
    return {
        /** 実行ファイル */
        alias: alias,
        /** 引数リスト */
        args: args,
        /** aliasとargsを繋げ、文字列にしたもの */
        full: [alias, ...args].join(String.space),
    };
}

export default function VideoCut() {
    const [Overlay, showOverlay] = useOverlay();
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();

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



    function setCurrentTimeByController(time: number) {
        if (videoRef.current == null) return;
        setCurrentTime(time);
        videoRef.current.currentTime = time;
    }

    function onPlay() {
        if (videoRef.current == null) return;
        setCurrentTime(videoRef.current.currentTime);
        // 動画再生時にのみ、次の描画フレームでシークバー更新するように
        if (!videoRef.current.paused) requestAnimationFrame(onPlay);
    }

    function isVideoPlaying() {
        if (videoRef.current == null) return false;
        return !videoRef.current.paused;
    }

    function playPauseToggle() {
        if (videoRef.current == null) return;
        isVideoPlaying() ? videoRef.current.pause() : videoRef.current.play();
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
                if (result) {
                    setInputFile(result);
                    setStartTime(0);
                    setCurrentTimeByController(0);
                }
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
            <div className="flex flex-row min-h-8">
                <SVGButton disabled={inputFile == null} src="play_pause.svg" onClick={playPauseToggle}/>
                <SVGButton disabled={inputFile == null||isVideoPlaying()} src="arrow_left.svg" onClick={() => setCurrentTimeByController(currentTime-0.1)}/>
                <SVGButton disabled={inputFile == null||isVideoPlaying()} src="arrow_right.svg" onClick={() => setCurrentTimeByController(currentTime+0.1)}/>
                <span className="my-auto mx-1">{secondToTime(currentTime)}</span>
                <input className="p-0 mx-1" type="range" min={0} max={duration} step={0.1} value={currentTime} onChange={v => setCurrentTimeByController(v.currentTarget.valueAsNumber)}/>
            </div>
            <div className="flex flex-row">
                <button disabled={endTime <= currentTime} onClick={() => setStartTime(currentTime)} onAuxClick={() => setCurrentTimeByController(startTime)}>{`START - ${secondToTime(startTime)}`}</button>
                <button disabled={startTime >= currentTime} onClick={() => setEndTime(currentTime)} onAuxClick={() => setCurrentTimeByController(endTime)}>{`END - ${secondToTime(endTime)}`}</button>
                <div className="grow min-w-1/10"/>
                <button disabled={inputFile == null} onClick={() => showOverlay()}>Go to output</button>
            </div>
            <Overlay>
                <div className="m-auto p-8 w-1/3 h-1/3 bg-bg border-1 justify-center border-app-edge flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={async () => {
                        const result = await save({
                            title: "Save",
                            filters: [{extensions: [Paths.splitExt(inputFile!).ext], name: ""}]
                        });
                        if (result != null) setOutputFile(result);
                        await Flintia.show();
                    }}>Browse output file</button>
                    <span>{outputFile ?? "No output file selected"}</span>
                    <hr className="mb-3"/>
                    <button onClick={() => {
                        const cmd = commandBuild(inputFile, outputFile, startTime, endTime, true);
                        Clipboards.copyText(cmd.full);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1000);
                    }}>{copied ? "Copied!" : "Copy FFmpeg Command"}</button>
                    <button disabled={!outputFile} className={"hidden".where(!CommandExists.FFmpeg)} title={"Please select output file".where(!outputFile)} onClick={async () => {
                        const cmd = commandBuild(inputFile, outputFile, startTime, endTime, false);
                        showOverlay(false);
                        setStaticOverlay(
                            <div className="h-full w-full flex" onClick={e => e.stopPropagation()}>
                                <span className="m-auto text-4xl">処理中...</span>
                            </div>
                        );
                        await WInvoke.runProcess(cmd.alias, ...cmd.args, "-y");
                        setStaticOverlay(undefined);
                    }}>Run FFmpeg</button>
                </div>
            </Overlay>
            {staticOverlay}
        </div>
    );
}
