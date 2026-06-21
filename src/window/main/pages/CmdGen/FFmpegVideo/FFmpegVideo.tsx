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
type SupportedVideoExtension = typeof SUPPORTED_VIDEO_EXTENSION[number];

export function Video() {
    const [sInputFile, setInputFile] = useState<string|null>(null);
    const [sVideoCodec, setVideoCodec] = useState<VideoCodec>("hevc_nvenc");
    const [sPreset, setPreset] = useState<Preset>("auto");
    const [sAudioCodec, setAudioCodec] = useState<AudioCodec>("auto");
    const [sQualityMode, setQualityMode] = useState<QualityMode>("cbr");
    const [sQualityValue, setQualityValue] = useState(0);
    const [sOutputFile, setOutputFile] = useState<string|null>(null);

    useEffect(() => setQualityValue(sQualityMode == "cbr" ? 1024*16 : 20), [sQualityMode]);

    const OutputFileExt = Paths.splitExt(sOutputFile ?? String.empty).ext as SupportedVideoExtension;

    // 選択肢用意
    const isntWebm = OutputFileExt != "webm";
    const oVideoCodec = useMemo(() => Map.create<VideoCodec, string>(m => {
        m
        .setIf("h264_nvenc", "h264", isntWebm)
        .setIf("hevc_nvenc", "HEVC", isntWebm)
        .set("av1_nvenc", "AV1")
        .set("copy", "copy")
        ;
    }), [isntWebm]);

    const oPreset = useMemo(() => new Map<Preset, string>()
        .set("auto", "auto")
        .set("p1", "ultraslow")
        .set("p2", "veryslow")
        .set("p3", "slow")
        .set("p4", "medium")
        .set("p5", "fast")
        .set("p6", "veryfast")
        .set("p7", "ultrafast")
    , []);

    const oAudioCodec = useMemo(() => Map.create<AudioCodec, string>(m => {
        m
        .setIf("aac", "aac", isntWebm)
        .set("libopus", "opus")
        .set("libvorbis", "vorbis")
        .setIf("flac", "flac", isntWebm)
        .setIf("libmp3lame", "mp3", isntWebm)
        .setIf("auto", "auto", isntWebm)
        .set("copy", "copy")
        ;
    }), [isntWebm]);

    const oQualityMode = useMemo(() => new Map<QualityMode, string>()
        .set("constqp", "CQP")
        .set("cbr", "CBR")
        .set("cq", "CQVBR")
    , []);



    // 消えた選択肢を選択していた場合の処理
    if (OutputFileExt == "webm") {
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
                <Select<VideoCodec> list={oVideoCodec} select={sVideoCodec} onSelectChange={setVideoCodec}/>
            </Setting>
            <Setting title="Preset" hide={sVideoCodec == "copy"}>
                <Select<Preset> list={oPreset} select={sPreset} onSelectChange={setPreset}/>
            </Setting>
            <Setting title="AudioCodec">
                <Select<AudioCodec> list={oAudioCodec} select={sAudioCodec} onSelectChange={setAudioCodec}/>
            </Setting>
            <Setting title="QualityMode" hide={sVideoCodec == "copy"}>
                <Select<QualityMode> list={oQualityMode} select={sQualityMode} onSelectChange={setQualityMode}/>
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
