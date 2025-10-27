import { open, save } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import { AudioCodec, BuildFFmpegCommand, Preset, QualityMode, VideoCodec } from "./CommandBuilder";
import { Clipboards } from "~/util/clipboard";
import { Flintia } from "~/Flintia";
import Setting from "~/components/Setting";
import { Paths } from "~/util/path";

const VIDEO_EXT = ["mp4", "mkv", "mov", "webm"] as const;

type VideoExt = typeof VIDEO_EXT[number];
type Choices<T> = Record<string, T>;

export default function Video() {
    const [sInputFile, setInputFile] = useState<string|null>(null);
    const [sVideoCodec, setVideoCodec] = useState<VideoCodec>("hevc_nvenc");
    const [sPreset, setPreset] = useState<Preset>("auto");
    const [sAudioCodec, setAudioCodec] = useState<AudioCodec>("auto");
    const [sQualityMode, setQualityMode] = useState<QualityMode>("cbr");
    const [sQualityValue, setQualityValue] = useState(0);
    const [sOutputFile, setOutputFile] = useState<string|null>(null);

    function Selector<Enum extends object>(props: {
        title: string,
        defaultValue: string | number | readonly string[] | undefined,
        onChange: (v: string) => void,
        options: Enum,
        hide?: boolean,
        sort?: boolean,
    }) {
        let data = Object.entries(props.options);
        if (props.sort) data = data.sort();
        return (
            <Setting title={props.title} hide={props.hide}>
                <select className="inline-block" defaultValue={props.defaultValue} onChange={v => props.onChange(v.target.value)}>
                    {data.map(([k, v], i) => v&&k ? <option key={i} value={v}>{k}</option> : undefined)}
                </select>
            </Setting>
        );
    }

    useEffect(() => setQualityValue(sQualityMode == "cbr" ? 1024*16 : 20), [sQualityMode]);

    const OUTPUT_FILE_EXT = Paths.splitExt(sOutputFile ?? String.empty).ext as VideoExt;

    // 選択肢用意
    const isntWebm = OUTPUT_FILE_EXT != "webm";
    const oVideoCodec: Choices<VideoCodec|undefined> = {
        h264: "h264_nvenc".where(isntWebm),
        HEVC: "hevc_nvenc".where(isntWebm),
        AV1: "av1_nvenc",
        copy: "copy",
    };

    const oPreset: Choices<Preset> = {
        auto: "auto",
        ultraslow: "p1",
        veryslow: "p2",
        slow: "p3",
        medium: "p4",
        fast: "p5",
        veryfast: "p6",
        ultrafast: "p7",
    }

    const oAudioCodec: Choices<AudioCodec|undefined> = {
        aac: "aac".where(isntWebm),
        opus: "libopus",
        vorbis: "libvorbis",
        flac: "flac".where(isntWebm),
        mp3: "libmp3lame".where(isntWebm),
        auto: "auto".where(isntWebm),
        copy: "copy",
    }

    const oQualityMode: Choices<QualityMode> = {
        CQP: "constqp",
        CBR: "cbr",
        CQVBR: "cq",
    };

    const oOutputExt: string[] = [...VIDEO_EXT];



    // 消えた選択肢を選択していた場合の処理
    if (OUTPUT_FILE_EXT == "webm") {
        if (!sVideoCodec.contains("av1_nvenc", "copy")) {
            setVideoCodec("av1_nvenc");
        }
    }

    if (sVideoCodec == "av1_nvenc") {
        if (!sAudioCodec.contains("libopus", "libvorbis")) {
            setAudioCodec("libopus");
        }
    }



    return (
        <>
            <Setting title="InputFile">
                <button onClick={
                    async() => {
                        open({
                            directory: false,
                            multiple: false,
                            title: "Select input file",
                            filters: [{
                                name: "movie file",
                                extensions: [...VIDEO_EXT]
                            }]
                        }).then(f => {
                            if (f != null) setInputFile(f);
                            Flintia.show();
                        });
                    }}>{sInputFile?.split("\\").slice(-1)[0] ?? "Browse..."}
                </button>
            </Setting>
            <Selector title="VideoCodec"    defaultValue={sVideoCodec   } onChange={v => setVideoCodec  (v as VideoCodec    )} options={oVideoCodec  }/>
            <Selector title="Preset"        defaultValue={sPreset       } onChange={v => setPreset      (v as Preset        )} options={oPreset      } hide={sVideoCodec == "copy"}/>
            <Selector title="AudioCodec"    defaultValue={sAudioCodec   } onChange={v => setAudioCodec  (v as AudioCodec    )} options={oAudioCodec  }/>
            <Selector title="QualityMode"   defaultValue={sQualityMode  } onChange={v => setQualityMode (v as QualityMode   )} options={oQualityMode } hide={sVideoCodec == "copy"}/>
            <Setting title={sQualityMode == "cbr" ? "Bitrate" : "QualityLevel"} hide={sVideoCodec == "copy"}>
                <input type="number"
                    className="pl-1"
                    value={sQualityValue}
                    step={sQualityMode == "cbr" ? 1024 : 1}
                    min={sQualityMode == "cbr" ? 1024 : 15}
                    max={sQualityMode == "cbr" ? 65536 : 30}
                    onChange={v => setQualityValue(v.target.valueAsNumber)}
                />
            </Setting>
            <Setting title="OutputFile">
                <button onClick={() => {
                    save({
                        filters: oOutputExt.map(v => ({name: String.empty, extensions: [v]})),
                        title: "Output file",
                    }).then(f => {
                        if (f != null) setOutputFile(f);
                        Flintia.show();
                    });
                }}>{sOutputFile?.split("\\").slice(-1)[0] ?? "Browse..."}</button>
            </Setting>
            {(() => {
                let [copied, setCopied] = useState(false);
                return <button onClick={() => {
                    // @ts-ignore
                    const cmd = BuildFFmpegCommand(
                        sInputFile ?? "i.",
                        sVideoCodec,
                        sPreset,
                        sAudioCodec,
                        sQualityMode,
                        sQualityValue,
                        sOutputFile ?? "o.",
                    );
                    Clipboards.copyText(cmd);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                }}>{copied ? "Copied!" : "Copy FFmpeg command"}</button>
            })()}
        </>
    );
}
