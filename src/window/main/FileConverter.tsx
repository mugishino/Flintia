import { useEffect, useState } from "react";
import Overlay from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { AUDIO_EXTENSIONS, Dialogs, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "~/util/dialog";
import { Paths } from "~/util/path";
import { CommandExists, DESKTOP_DIR } from "~/Data";
import Setting from "~/components/Setting";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { Event } from "@tauri-apps/api/event";
import { Command } from "@tauri-apps/plugin-shell";
import { WInvoke } from "~/InvokeWrapper";
import { DragProvider, DragType } from "./DragProvider";

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

const ExtensionMap = Map.fromObject({
    [SupportedType.Image]: ["png", "jpg", "tiff", "avif"],
    [SupportedType.Audio]: ["mp3", "wav", "flac", "ogg", "opus"],
    [SupportedType.Video]: ["mp3", "wav", "flac", "ogg", "opus"],
    [SupportedType.Unsupported]: [String.empty],
});

export default function FileConverter() {
    // overlay
    const [dropOverlay, setDropOverlay] = useState(false);
    const [convertOverlay, setConvertOverlay] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

    // converter
    const [inputFileType, setInputFileType] = useState<SupportedType>(SupportedType.Unsupported);
    const [files, setFiles] = useState<string[]>([]);
    const [outputFileType, setOutputFileType] = useState<string|undefined>();
    const [isTrash, setIsTrash] = useState(false);

    // output
    const [cmdlog, setCmdlog] = useState<string|undefined>();

    function addLog(text: string, ln: boolean=true) {
        if (cmdlog == undefined) setCmdlog(String.empty);
        setCmdlog(prev => prev + (ln ? "\n" : String.empty) + text);
    }

    // update
    useEffect(() => {
        setOutputFileType(ExtensionMap.get(inputFileType.toString())?.get(0));
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
                if (convertType.has(SupportedType.Unsupported)) return "対応していない拡張子のファイルが含まれています。";
                if (convertType.size > 1) return "複数のタイプのファイルが含まれています。";
                return;
            });
            setInputFileType(fileTypes.get(0) ?? SupportedType.Unsupported);
            setFiles(files);
        });
    }, []);

    async function convertAndExport(outdir?: string) {
        setConvertOverlay(false);
        setCmdlog(String.empty);
        files.forEach(async f => {
            addLog(Paths.getBasename(f) + " -> ", false);
            const o_dir = outdir ?? Paths.getDirectory(f);
            const o_name = Paths.splitExt(Paths.getBasename(f)).name;
            const o = Paths.join(o_dir, `${o_name}.${outputFileType}`);
            // 出力後が同じならスキップ
            if (Paths.equals(o, f)) {
                addLog("Skip[equals] " + o)
            }

            const args = ["-y", "-vn".where(inputFileType == SupportedType.Video), "-i", f, o].nullFilter();
            const cmd = Command.create("ffmpeg", args);
            const result = await cmd.execute();
            if (result.code == 0) {
                addLog("Success: " + o_name+"."+outputFileType);
                if (isTrash) await WInvoke.fileTrash([f]);
            } else {
                addLog("Failed: code " + result.code + "\n" + result.stdout);
            }
        });
    }



    return (
        <div className="contents">
            <div className={`absolute top-0 left-0 h-full w-full z-10 bg-overlay-bg flex justify-center items-center ${"hidden".where(!dropOverlay)}`}>ドロップしてファイルを変換</div>
            <Overlay show={cmdlog != undefined} setShow={() => setCmdlog(undefined)}>
                <div className="h-full w-full flex flex-col justify-between">
                    {cmdlog}
                </div>
            </Overlay>
            <Overlay show={convertOverlay} setShow={setConvertOverlay}>
                <OverlayWindow className="w-2/3 gap-1">
                    {errorMessage ?
                        <>
                            <span className="text-fail">{errorMessage}</span>
                            <button onClick={() => {
                                setConvertOverlay(false);
                            }}>OK</button>
                        </>
                    : <>
                        <Setting title="変換先">
                            <select value={outputFileType} onChange={v => setOutputFileType(v.currentTarget.value)}>
                                {ExtensionMap.get(inputFileType.toString())?.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </Setting>
                        <div className="flex flex-row justify-between pl-1">
                            <span className="grow">元ファイルをゴミ箱に移動</span>
                            <input type="checkbox" checked={isTrash} onChange={e => setIsTrash(e.currentTarget.checked)}/>
                        </div>
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
