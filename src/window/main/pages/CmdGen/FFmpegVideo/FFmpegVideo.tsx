import { useEffect, useMemo, useState } from "react";
import { AudioCodec, BuildFFmpegCommand, Preset, QualityMode, VideoCodec } from "./CommandBuilder";
import { Clipboards } from "~/util/clipboard";
import { FlintiaWindow } from "~/Flintia";
import { Setting } from "~/components/Setting";
import { Paths } from "~/util/path";
import { Dialogs, VIDEO_EXTENSIONS } from "~/module/Dialogs";
import { ifPresent } from "~/util/util";
import { Select } from "~/components/Select";

const SUPPORTED_VIDEO_EXTENSION = ["mp4", "mkv", "mov", "webm"] as const;

type VideoExt = typeof SUPPORTED_VIDEO_EXTENSION[number];

export function Video() {
    const [sInputFile, setInputFile] = useState<string|null>(null);
    const [sVideoCodec, setVideoCodec] = useState<VideoCodec>("hevc_nvenc");
    const [sPreset, setPreset] = useState<Preset>("auto");
    const [sAudioCodec, setAudioCodec] = useState<AudioCodec>("auto");
    const [sQualityMode, setQualityMode] = useState<QualityMode>("cbr");
    const [sQualityValue, setQualityValue] = useState(0);
    const [sOutputFile, setOutputFile] = useState<string|null>(null);

    useEffect(() => setQualityValue(sQualityMode == "cbr" ? 1024*16 : 20), [sQualityMode]);

    const OUTPUT_FILE_EXT = Paths.splitExt(sOutputFile ?? String.empty).ext as VideoExt;

    // 選択肢用意
    const isntWebm = OUTPUT_FILE_EXT != "webm";
    const oVideoCodec = useMemo(() => Map.create<string, VideoCodec>(m => {
        m
        .setIf("h264", "h264_nvenc", isntWebm)
        .setIf("HEVC", "hevc_nvenc", isntWebm)
        .set("AV1", "av1_nvenc")
        .set("copy", "copy")
        ;
    }), [isntWebm]);

    const oPreset = useMemo(() => new Map<string, Preset>()
        .set("auto", "auto")
        .set("ultraslow", "p1")
        .set("veryslow", "p2")
        .set("slow", "p3")
        .set("medium", "p4")
        .set("fast", "p5")
        .set("veryfast", "p6")
        .set("ultrafast", "p7")
    , []);

    const oAudioCodec = useMemo(() => Map.create<string, AudioCodec>(m => {
        m
        .setIf("aac", "aac", isntWebm)
        .set("opus", "libopus")
        .set("vorbis", "libvorbis")
        .setIf("flac", "flac", isntWebm)
        .setIf("mp3", "libmp3lame", isntWebm)
        .setIf("auto", "auto", isntWebm)
        .set("copy", "copy")
        ;
    }), [isntWebm]);

    const oQualityMode = useMemo(() => new Map<string, QualityMode>()
        .set("CQP", "constqp")
        .set("CBR", "cbr")
        .set("CQVBR", "cq")
    , []);



    // 消えた選択肢を選択していた場合の処理
    //! Selectの現状の機能的に動作しません。改善予定。
    if (OUTPUT_FILE_EXT == "webm") {
        if (!sVideoCodec.contains("av1_nvenc", "copy")) {
            setVideoCodec("av1_nvenc");
        }
        if (!sAudioCodec.contains("libopus", "libvorbis")) {
            setAudioCodec("libopus");
        }
    }



    return (
        <>
            <Setting title="InputFile">
                <button onClick={async() => {
                    const f = await Dialogs.openSingleFile("Select input file", [VIDEO_EXTENSIONS]);
                    if (f != null) setInputFile(f);
                    FlintiaWindow.getCurrentWindow().then(v => v.show());
                }}>{sInputFile?.split("\\").slice(-1)[0] ?? "Browse..."}</button>
            </Setting>
            <Setting title="VideoCodec">
                <Select<VideoCodec> value={oVideoCodec} onSelectChange={v => setVideoCodec(v)} defaultSelect={sVideoCodec}/>
            </Setting>
            <Setting title="Preset" hide={sVideoCodec == "copy"}>
                <Select<Preset> value={oPreset} onSelectChange={v => setPreset(v)} defaultSelect={sPreset}/>
            </Setting>
            <Setting title="AudioCodec">
                <Select<AudioCodec> value={oAudioCodec} onSelectChange={setAudioCodec} defaultSelect={sAudioCodec}/>
            </Setting>
            <Setting title="QualityMode" hide={sVideoCodec == "copy"}>
                <Select<QualityMode> value={oQualityMode} onSelectChange={setQualityMode} defaultSelect={sQualityMode} />
            </Setting>
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
                <button onClick={async() => {
                    const f = await Dialogs.save("Output file", [{name: "Supported", extensions: [...SUPPORTED_VIDEO_EXTENSION]}], ifPresent(sInputFile, v => Paths.getDirectory(v)));
                    if (f != null) setOutputFile(f);
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
