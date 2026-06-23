import { useEffect, useState } from "react";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { AUDIO_EXTENSIONS, Dialogs, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "~/module/Dialogs";
import { Paths } from "~/util/path";
import { CommandExists, DESKTOP_DIR } from "~/Data";
import { Setting } from "~/components/Setting";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { Event } from "@tauri-apps/api/event";
import { Command } from "@tauri-apps/plugin-shell";
import { WInvoke } from "~/InvokeWrapper";
import { DragProvider, DragType } from "./DragProvider";
import { Line } from "~/components/Line";
import { Logger } from "~/module/Logger";
import { Result } from "~/util/class/Result";
import { useMapState } from "~/hooks/useMapState";
import { ifPresent } from "~/util/util";
import { Select } from "~/components/Select";

interface DragDropPayload {
    paths: string[];
    position: { x: number; y: number };
}

enum SupportedType {
    Unsupported,
    Image,
    Audio,
    Video,
}

const ExtensionMap = new Map<SupportedType, string[]>()
    .set(SupportedType.Image, ["png", "jpg", "tiff", "avif", "webp", "jxl"])
    .set(SupportedType.Audio, ["mp3", "wav", "flac", "ogg", "opus"])
    .set(SupportedType.Video, ["mp3", "wav", "flac", "ogg", "opus"])
    .set(SupportedType.Unsupported, [String.empty])
;

const LOSSLESS_DATA = new Map<string, string[]>()
.set("webp", ["-lossless", "1"])
.set("avif", ["-lossless", "1"])
;

interface QualityData {
    max: number,
    min: number,
    defaultValue: number,
    arg: string,
}
const QUALITY_DATA = new Map<string, QualityData & {title?: string}>()
.set("webp", {min: 0, max: 80, defaultValue: 80, arg: "-quality", title: "losslessを有効化するとこのパラメータは圧縮率になります"})
.set("jxl" , {min: 0, max: 15, defaultValue: 1, arg: "-distance"})
;

/**
 * ffmpegでの変換コマンドの引数を作成します。
 * @param input 変換元ファイル
 * @param inputType 変換元ファイルのタイプ
 * @param outdir 変換出力ディレクトリ。未指定で変換元ファイルと同じディレクトリ。
 * @param outputType 変換先の形式
 * @param lossless 可逆圧縮にするかどうか
 * @returns コマンドの引数
 */
async function makeCommandArgs(
    input: string,
    inputType: SupportedType,
    outdir: string|undefined,
    outputType: string,
    lossless: boolean,
    quality: number,
    option: {
        drawingMode?: boolean,
    },
): Promise<Result<string[], string>> {
    const o_dir = outdir ?? Paths.getDirectory(input);
    const o_name = Paths.splitExt(Paths.getBasename(input)).name;
    const o = Paths.join(o_dir, `${o_name}.${outputType}`);
    // 出力後が同じなら失敗扱いにする
    if (Paths.equals(o, input)) {
        return Result.Err("The output file is the same as the input file.");
    }

    // command build
    const args: (string|undefined)[] = [];
    switch (outputType) {
        case "avif":
            args.push(
                "-c:v", "libsvtav1",
                "-color_range", "pc",
                "-pix_fmt", "gbrap10le",
                "-colorspace", "bt709",
                "-color_primaries", "bt709",
                "-color_trc", "iec61966-2-1",
                ...lossless ? ["-lossless", "1"] : [],
                "-crf", "18",
            );
            break;
        // @ts-expect-error: fall through
        case "webp":
            if (option.drawingMode) args.push("-preset", "drawing");
        default:
            const qualityData = QUALITY_DATA.get(outputType);
            args.push(
                // 変換元が映像の場合、変換先が音声なので映像を削除してエンコードすることを明示。
                "-vn".where(inputType == SupportedType.Video),
                ...lossless ? [] : LOSSLESS_DATA.get(outputType) ?? [],
                ...qualityData ? [qualityData.arg, quality.toString()] : [],
            );
            break;
    }
    const result = ["-y", "-i", input, ...args, o].nullFilter();
    Logger.debug("ffmpeg " + result.join(" "));
    return Result.Ok(result);
}



export function FileConverter() {
    // overlay
    const [dropOverlay, setDropOverlay] = useState(false);
    const [convertOverlay, setConvertOverlay] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

    // converter
    const [inputFileType, setInputFileType] = useState<SupportedType>(SupportedType.Unsupported);
    const [files, setFiles] = useState<string[]>([]);
    const [outputFileType, setOutputFileTypeRaw] = useState<string|undefined>();
    const [isTrash, setIsTrash] = useState(false);

    // option
    const [lossless, setLossless] = useState(false);
    const [quality, setQuality] = useState(0);
    // webp option
    const [drawingMode, setDrawingMode] = useState(false);

    // output
    const [convertStatus, setConvertStatusRaw] = useMapState<string, string>();
    function setConvStat(key: string, value: string) {
        setConvertStatusRaw(m => m.set(key, value));
    }

    function setOutputFileType(value: string|undefined) {
        setOutputFileTypeRaw(value);
        if (value == undefined) return;
        ifPresent(QUALITY_DATA.get(value), v => setQuality(v.defaultValue));
    }

    // update
    useEffect(() => {
        setOutputFileType(ExtensionMap.get(inputFileType)?.get(0));
    }, [inputFileType]);

    function onDragEvent(isEnter: boolean, event: Event<DragDropPayload>) {
        // ファイル以外のドラッグは表示しない
        if (isEnter && event.payload.paths.length == 0) return;

        setDropOverlay(isEnter);
        document.body.classList[isEnter ? "add" : "remove"]("no-pointer-events");
    }

    // drag and drop register
    useEffectAsync(async() => {
        if (!CommandExists.FFmpeg) return;

        DragProvider.setDefaultListener(DragType.Enter, e => onDragEvent(true , e));
        DragProvider.setDefaultListener(DragType.Leave, e => onDragEvent(false, e));
        DragProvider.setDefaultListener(DragType.Drop , e => {
            // reset
            onDragEvent(false, e);
            setIsTrash(false);

            // ファイルを取得
            const files = e.payload.paths;
            if (!files) return;

            // エラー出ても表示するので
            setConvertOverlay(true);

            // 拡張子に変換し、サポートしているかを確認
            const extensions = files.map(v => Paths.splitExt(v).ext);
            const fileTypes = extensions.map(v => {
                if (IMAGE_EXTENSIONS.extensions.includes(v)) return SupportedType.Image;
                if (AUDIO_EXTENSIONS.extensions.includes(v)) return SupportedType.Audio;
                if (VIDEO_EXTENSIONS.extensions.includes(v)) return SupportedType.Video;
                return SupportedType.Unsupported;
            });
            const convertType = new Set(fileTypes);
            setErrorMessage(() => {
                if (convertType.has(SupportedType.Unsupported)) return "対応していない拡張子が含まれています。";
                if (convertType.size > 1) return "複数のタイプのファイルが含まれています。";
                return;
            });
            setInputFileType(fileTypes.get(0) ?? SupportedType.Unsupported);
            setFiles(files);
        });
    }, []);

    async function convertAndExport(outdir?: string) {
        if (outputFileType == undefined) return Logger.error("outputFileType is undefined.");

        setConvertOverlay(false);
        setConvertStatusRaw(new Map());
        files.forEach(async f => {
            const logKey = Paths.getBasename(f);
            (await makeCommandArgs(
                f,
                inputFileType,
                outdir,
                outputFileType,
                lossless,
                quality,
                {
                    drawingMode: drawingMode,
                }
            ))
            .map_err(err => setConvStat(logKey, "Failed: " + err))
            .map(async args => {
                setConvStat(logKey, "Converting...");
                // run
                const cmd = Command.create("ffmpeg", args);
                const result = await cmd.execute();
                if (result.code == 0) {
                    setConvStat(logKey, "Done");
                    if (isTrash) await WInvoke.fileTrash([f]);
                } else {
                    setConvStat(logKey, "Failed: code " + result.code);
                }
            });
        });
    }



    return (
        <div className="contents">
            <Overlay show={dropOverlay} setShow={() => {}}>
                <div className={`h-full w-full flex justify-center items-center`}>ドロップしてファイルを変換</div>
            </Overlay>
            <Overlay show={!convertStatus.isEmpty()} setShow={() => setConvertStatusRaw(new Map())}>
                <div className="h-full w-full flex flex-col p-1 justify-between">
                    {convertStatus.map((k, v) => <div key={k}>{k}: {v}</div>)}
                </div>
            </Overlay>
            <Overlay show={convertOverlay} setShow={setConvertOverlay}>
                <OverlayWindow className="w-2/3 gap-1">
                    {errorMessage ?
                        <>
                            <span className="text-fail text-center">{errorMessage}</span>
                            <button onClick={() => {
                                setConvertOverlay(false);
                            }}>OK</button>
                        </>
                    : <>
                        <Setting title="変換先">
                            <Select list={ExtensionMap.get(inputFileType) ?? []} select={outputFileType} onSelectChange={v => setOutputFileType(v)} />
                        </Setting>
                        <div className="flex flex-row justify-between pl-1">
                            <span className="grow">元ファイルをゴミ箱に移動</span>
                            <input type="checkbox" checked={isTrash} onChange={e => setIsTrash(e.currentTarget.checked)}/>
                        </div>
                        <Line className="my-0"/>
                        {LOSSLESS_DATA.containsKey(outputFileType) && <>
                            <Setting title="無劣化" childClassName="flex justify-end">
                                <input type="checkbox" checked={lossless} onChange={e => setLossless(e.currentTarget.checked)}/>
                            </Setting>
                        </>}
                        {(() => {
                            const data = QUALITY_DATA.getAny(outputFileType);
                            if (data == undefined) return;
                            let label = quality.toString();
                            if (outputFileType == "jxl" && quality == 0) label = "無劣化";
                            return (
                                <Setting title={`クオリティ= ${label}`} tooltip={data.title} childClassName="">
                                    <input type="range" min={data.min} max={data.max} value={quality} onChange={e => setQuality(e.currentTarget.valueAsNumber)} className="align-top"/>
                                </Setting>
                            );
                        })()}
                        {outputFileType == "webp" && <>
                            <Setting title="DrawingMode" tooltip="イラストなどアニメ塗りに向いた変換をします" childClassName="flex justify-end">
                                <input type="checkbox" checked={drawingMode} onChange={e => setDrawingMode(e.currentTarget.checked)}/>
                            </Setting>
                        </>}
                        <button onClick={async() => await convertAndExport()}>同じディレクトリに出力</button>
                        <button onClick={async() => {
                            const dirpath = await Dialogs.openSingleDirectory("Select output directory", DESKTOP_DIR);
                            if (dirpath == null) return;
                            await convertAndExport(dirpath);
                        }}>違うディレクトリに出力</button>
                    </>}
                </OverlayWindow>
            </Overlay>
        </div>
    );
}
