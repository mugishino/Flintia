import { convertFileSrc } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import { useEffect, useRef, useState } from "react";
import { Overlay } from "~/components/Overlay";
import { Setting } from "~/components/Setting";
import { SVGButton } from "~/components/SVGButton";
import { CommandExists, DefaultFileName } from "~/Data";
import { FlintiaWindow } from "~/Flintia";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";
import { Nullable } from "~/util/type";
import { BitrateCalc } from "./Tools/BitrateCalc";
import { Dialogs, VIDEO_EXTENSIONS } from "~/module/Dialogs";
import { DragProvider, DragType } from "../DragProvider";
import { ifPresent } from "~/util/util";

function secondToTime(sec: number) {
    const h = (sec/3600).toInt().toStringZero(2);
    const m = (sec/60).toInt().toStringZero(2);
    const s = ("0"+(sec%60).toFixed(1)).slice(-4);
    return `${h}:${m}:${s}`;
}

type VideoCodec = "h264_nvenc" | "hevc_nvenc" | "av1_nvenc";

/**
 * FFmpegのコマンドを生成します。
 * @param inputFile 入力ファイル. undefinedの場合デフォルトのファイル名
 * @param outputFile 出力ファイル. undefinedの場合デフォルトのファイル名
 * @param startTime 開始時間(自動で小数第一位以下切り捨て)
 * @param endTime 終了時間(自動で小数第一位以下切り捨て)
 * @param escape ファイル名をエスケープするか(コマンドコピー用)
 * @param videoCodec 動画のエンコード形式
 * @param bitrate 動画のビットレート
 * @returns 生成されたコマンドのデータ
 */
function commandBuild(
    inputFile: Nullable<string>,
    outputFile: Nullable<string>,
    startTime: number,
    endTime: number,
    videoCodec: VideoCodec,
    bitrate: number,
    escape: boolean,
) {
    const i = inputFile ?? DefaultFileName.Input;
    const o = (outputFile ?? DefaultFileName.Output) + (videoCodec == "av1_nvenc" ? ".webm" : ".mp4");
    const ss = Math.floorEx(startTime, 1).toString();
    const to = Math.floorEx(endTime, 1).toString();

    const alias = "ffmpeg";
    const args = [
        "-i", escape ? `"${i}"` : i,
        "-ss", ss,
        "-to", to,
        "-c:a", "libopus",
        "-c:v", videoCodec,
        "-b:v", bitrate+"K",
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

export function VideoCut() {
    const [overlay, showOverlay] = useState(false);
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();

    // core
    const [inputFile, setInputFile] = useState<string|undefined>(undefined);
    const videoRef = useRef<HTMLVideoElement>(null);
    // video data
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // edit data
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    // overlay
    const [outputFile, setOutputFile] = useState<string|null>(null);
    const [bitrate, setBitrate] = useState(4096);
    const [videoCodec, setVideoCodec] = useState<VideoCodec>("av1_nvenc");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        DragProvider.setListener(DragType.Enter);
        DragProvider.setListener(DragType.Leave);
        DragProvider.setListener(DragType.Drop, e => {
            const file = e.payload.paths.get(0);
            if (!file) return;

            const ext = Paths.splitExt(file).ext;
            if (!VIDEO_EXTENSIONS.extensions.contains(ext)) return;

            setInputFile(file);
        });
    }, []);

    useEffect(() => {
        setOutputFile(null);
        setStartTime(0);
        setCurrentTimeByController(0);
    }, [inputFile]);



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
            <button className="border-0 border-b" onClick={async () => ifPresent(await Dialogs.openSingleFile("Select Video", [VIDEO_EXTENSIONS]), f => setInputFile(f))}>{Paths.getBasename(inputFile ?? "Browse...")}</button>
            <div className="flex grow shrink basis-auto overflow-hidden relative">
                <div className={`absolute h-full w-1/4 z-10 ${"hover:bg-videocut-skip-hover".where(!!inputFile)}`} onClick={() => setCurrentTimeByController(Math.max(currentTime-5, 0))}></div>
                <div className={`absolute h-full w-1/4 z-10 ${"hover:bg-videocut-skip-hover".where(!!inputFile)} right-0`} onClick={() => setCurrentTimeByController(Math.min(currentTime+5, duration))}></div>
                <div className="absolute h-full w-full flex justify-center items-center text-text-gray -z-10">上のBrowseまたはD&Dでファイルを読み込み</div>
                <video
                    ref={videoRef}
                    className="object-contain mx-auto"
                    src={!inputFile ? undefined : convertFileSrc(inputFile)}
                    onClick={playPauseToggle}
                    onPlay={onPlay}
                    onLoadedMetadata={v => {
                        const time = v.currentTarget.duration;
                        setDuration(time);
                        setEndTime(time);
                    }
                }/>
            </div>
            <div className="flex flex-row min-h-8">
                <SVGButton disabled={!inputFile} src="play_pause.svg" onClick={playPauseToggle}/>
                <SVGButton disabled={!inputFile||isVideoPlaying()||currentTime<=0} src="arrow_left.svg" onClick={() => setCurrentTimeByController(Math.max(currentTime-0.1, 0))}/>
                <SVGButton disabled={!inputFile||isVideoPlaying()||currentTime>=duration} src="arrow_right.svg" onClick={() => setCurrentTimeByController(currentTime+0.1)}/>
                <span className="my-auto mx-1">{secondToTime(currentTime)}</span>
                <input className="p-0 mx-1" type="range" min={0} max={duration} step={0.1} value={currentTime} onChange={v => setCurrentTimeByController(v.currentTarget.valueAsNumber)}/>
            </div>
            <div className="flex flex-row">
                <button disabled={endTime <= currentTime} onClick={() => setStartTime(currentTime)} onAuxClick={() => setCurrentTimeByController(startTime)}>{`START - ${secondToTime(startTime)}`}</button>
                <button disabled={startTime >= currentTime} onClick={() => setEndTime(currentTime)} onAuxClick={() => setCurrentTimeByController(endTime)}>{`END - ${secondToTime(endTime)}`}</button>
                <div className="grow min-w-1/10"/>
                <button disabled={!inputFile} onClick={() => setStaticOverlay(
                    <video src={!inputFile ? undefined : convertFileSrc(inputFile)+`#t=${startTime},${endTime}`} className="m-auto h-7/8 w-7/8" autoPlay onClick={e => e.stopPropagation()}/>
                )}>プレビュー</button>
                <button disabled={!inputFile} onClick={() => showOverlay(true)}>出力設定</button>
            </div>
            <Overlay show={overlay} setShow={showOverlay}>
                <div className="h-full w-full flex flex-col gap-4 justify-center items-center">
                    <div className="p-8 w-1/3 bg-bg border justify-center border-app-edge flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={async () => {
                            const result = await Dialogs.save("Save");
                            if (result != null) setOutputFile(result);
                            FlintiaWindow.getCurrentWindow().then(v => v.show());
                        }}>Browse output file</button>
                        <span>{outputFile ?? "No output file selected"}{videoCodec == "av1_nvenc" ? ".webm" : ".mp4"}</span>
                        <hr className="mb-3"></hr>
                        <Setting title="Codec">
                            <select value={videoCodec} onChange={v => setVideoCodec(v.currentTarget.value as VideoCodec)}>
                                <option value={"h264_nvenc"}>h264</option>
                                <option value={"hevc_nvenc"}>HEVC</option>
                                <option value={"av1_nvenc"}>AV1</option>
                            </select>
                        </Setting>
                        <Setting title="Bitrate">
                            <input type="number" min={128} step={128} value={bitrate} onChange={v => setBitrate(v.currentTarget.valueAsNumber.orDefault(1))}/>
                        </Setting>
                        <hr className="mb-3"/>
                        <button onClick={() => {
                            const cmd = commandBuild(inputFile, outputFile, startTime, endTime, videoCodec, bitrate, true);
                            Clipboards.copyText(cmd.full);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1000);
                        }}>{copied ? "Copied!" : "Copy FFmpeg Command"}</button>
                        <button disabled={!outputFile} className={"hidden".where(!CommandExists.FFmpeg)} title={"Please select output file".where(!outputFile)} onClick={async () => {
                            const cmd = commandBuild(inputFile, outputFile, startTime, endTime, videoCodec, bitrate, false);
                            showOverlay(false);
                            setStaticOverlay(
                                <div className="h-full w-full flex flex-col text-center" onClick={e => e.stopPropagation()}>
                                    <span className="m-auto text-4xl">処理中...</span>
                                    <button className="inline-block opacity-100" onClick={() => setStaticOverlay(undefined)}>バックグラウンドで実行</button>
                                </div>
                            );
                            await Command.create(cmd.alias, [...cmd.args, "-y"]).execute().finally(() => setStaticOverlay(undefined));
                        }}>Run FFmpeg</button>
                    </div>
                    <div className="bg-bg p-4 border border-app-edge w-1/3 flex flex-col" onClick={e => e.stopPropagation()}>
                        <span className="text-center">BitrateCalc - 正確性は保証しません</span>
                        <BitrateCalc duration={Math.trunc((endTime - startTime)*10)/10}/>
                    </div>
                </div>
            </Overlay>
            {staticOverlay}
        </div>
    );
}
