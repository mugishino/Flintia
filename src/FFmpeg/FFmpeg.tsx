import { open, save } from "@tauri-apps/plugin-dialog";
import css from "./FFmpeg.module.css";
import React, { useState } from "react";
import { WInvoke } from "../InvokeWrapper";

enum VideoCodec {
    h264 = "h264_nvenc",
    hevc = "hevc_nvenc",
    av1 = "av1_nvenc",
    copy = "copy",
}

enum AudioCodec {
    aac = "aac",
    opus = "libopus",
    ogg = "libvorbis",
    mp3 = "libmp3lame",
    copy = "copy",
}

enum Preset {
    ultraslow = "1",
    veryslow = "p2",
    slow = "p3",
    medium = "p4",
    fast = "p5",
    veryfast = "p6",
    ultrafast = "p7",
}

enum QualityMode {
    CQP = "constqp", // 一定画質 15~28が推奨 値が小さくなるほど高品質
    CBR = "cbr", // 固定ビットレート
    CQVBR = "cq", // 品質優先可変ビットレート
}

enum Extension {
    mp4 = "mp4",
    mkv = "mkv",
    webm = "webm",
    mov = "mov",
}

function BuildCommand(
    i: string,
    videoCodec: VideoCodec,
    preset: Preset,
    audioCodec: AudioCodec,
    qualityMode: QualityMode,
    qualityValue: number,
    outputFileName: string,
    outputFileExtension: Extension,
) {
    let command = ["ffmpeg"];
    command.push("-i", i); // input file
    command.push("-c:v", videoCodec); // video codec
    command.push("-preset", preset); // preset
    command.push("-c:a", audioCodec); // audio codec

    // quality mode
    command.push("-rc", qualityMode);
    switch (qualityMode) {
        case QualityMode.CQP:
            command.push("-qp", qualityValue.toString());
            break;
        case QualityMode.CBR:
            command.push("-b:v", qualityValue+"K");
            break;
        case QualityMode.CQVBR:
            command.push("-cq", qualityValue.toString());
            break;
    }

    // その他
    command.push("-movflags", "+faststart"); // メタ情報を先頭に配置

    // output file
    command.push(outputFileName+"."+outputFileExtension);
    return command.join(" ");
}



/**
 * EnumをOptionの配列で返します
 * @param arg 非型安全なので注意。Enumを渡してください
 * @returns Option要素の配列
 */
function EnumToOptions<T extends object>(arg: T) {
    let elems: React.JSX.Element[] = [];
    Object.entries(arg).forEach((k, i) => {
        elems.push(<option key={i} value={k[1]}>{k[0]}</option>);
    });
    return elems;
}

// TODO: Extensionを直す
// TODO: QualityValueを作る
// TODO: セレクタのコンポーネント化

export default function FFmpeg() {
    const [inputFile, setInputFile] = useState<string|null>(null);
    const [videoCodec, setVideoCodec] = useState(VideoCodec.hevc);
    const [preset, setPreset] = useState(Preset.medium);
    const [audioCodec, setAudioCodec] = useState(AudioCodec.aac);
    const [qualityMode, setQualityMode] = useState(QualityMode.CQP);
    const [qualityValue, setQualityValue] = useState(0);
    const [outputFile, setOutputFile] = useState<string>("output.webm");
    const [extension, setExtension] = useState(Extension.webm);

    return (
        <>
            <div style={{textAlign: "center", borderBottom: "thin solid gray"}}>動画にのみ対応しています。NVENCを使用します。</div>
            <div className={css.setting}>
                <span>InputFile</span>
                <button className={css.button} onClick={
                    async() => {
                        open({
                            directory: false,
                            multiple: false,
                            title: "Select input file",
                            filters: [{
                                name: "movie file",
                                extensions: ["mp4", "mkv", "mov", "webm"]
                            }]
                        }).then(f => {
                            if (f != null) setInputFile(f);
                            WInvoke.show();
                        });
                    }}>{inputFile?.split("\\").slice(-1)[0] ?? "Browse..."}
                </button>
            </div>
            <div className={css.setting}>
                <span>VideoCodec</span>
                <select className={css.selector} defaultValue={videoCodec} onChange={v => setVideoCodec(v.target.value as VideoCodec)}>
                    {EnumToOptions(VideoCodec)}
                </select>
            </div>
            <div className={css.setting}>
                <span>Preset</span>
                <select className={css.selector} defaultValue={preset} onChange={v => setPreset(v.target.value as Preset)}>
                    {EnumToOptions(Preset)}
                </select>
            </div>
            <div className={css.setting}>
                <span>AudioCodec</span>
                <select className={css.selector} defaultValue={audioCodec} onChange={v => setAudioCodec(v.target.value as AudioCodec)}>
                    {EnumToOptions(AudioCodec)}
                </select>
            </div>
            <div className={css.setting}>
                <span>QualityMode</span>
                <select className={css.selector} defaultValue={qualityValue} onChange={v => setQualityMode(v.target.value as QualityMode)}>
                    {EnumToOptions(QualityMode)}
                </select>
            </div>
            <div className={css.setting}>
                <span>OutputFile</span>
                <button className={css.button} onClick={() => {
                    save({
                        filters: [{
                            name: "webm",
                            extensions: ["webm"]
                        }],
                        title: "Output file",
                    }).then(f => {
                        if (f != null) setOutputFile(f);
                        WInvoke.show();
                    });
                }}>{outputFile.split("\\").slice(-1)[0] ?? "Browse..."}</button>
            </div>
            <div className={css.setting}>
                <span>OutputExtension</span>
                <select className={css.selector} defaultValue={extension} onChange={v => setExtension(v.target.value as Extension)}>
                    {EnumToOptions(Extension)}
                </select>
            </div>
            <button style={{fontSize: "1.2rem"}} className={css.button} disabled={(() => {
                // ボタン無効化条件
                if (inputFile == null) return true;
                return false;
            })()} onClick={() => {
                const cmd = BuildCommand(
                    // @ts-ignore
                    inputFile,
                    videoCodec,
                    preset,
                    audioCodec,
                    qualityMode,
                    0,
                    outputFile,
                    extension
                );
                navigator.clipboard.writeText(cmd);
            }}>Copy FFmpeg command</button>
        </>
    );
}
