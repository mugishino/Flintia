import { desktopDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { WInvoke } from "~/InvokeWrapper";
import { copyText, getBasename } from "~/util";

const DESKTOP_DIR = await desktopDir();
export default function ExportKeyFrame() {
    const [video, setVideo] = useState(String.empty);
    const [outdir, setOutdir] = useState(String.empty);

    const [copied, setCopied] = useState(false);

    return (
        <>
            <button onClick={async () => {
                await open({
                    defaultPath: DESKTOP_DIR,
                    directory: false,
                    multiple: false,
                    title: "Select Video",
                    filters: [{
                        name: "Video",
                        extensions: ["mp4", "webm", "mkv", "mov"]
                    }],
                }).then(async v => {
                    await WInvoke.show();
                    if (v != null) setVideo(v);
                });
            }}>{video ? getBasename(video) : "キーフレームを抽出する動画"}</button>

            <button onClick={async () => {
                await open({
                    defaultPath: DESKTOP_DIR,
                    directory: true,
                    title: "Output Directory"
                }).then(async v => {
                    await WInvoke.show();
                    if (v != null) setOutdir(v);
                });
            }}>{outdir ? outdir : "出力ディレクトリ"}</button>

            <button disabled={!video || !outdir} onClick={() => {
                copyText(`ffmpeg -i "${video}" -vf "select='eq(pict_type\,I)'" -vsync vfr -frame_pts true "${outdir}\\%03d.png"`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }}>{copied ? "コピーしました" : "クリックでコマンドをコピー"}</button>
        </>
    );
}
