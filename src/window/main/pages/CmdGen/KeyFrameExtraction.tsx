import { desktopDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { Paths } from "~/util/path";
import { Clipboards } from "~/util/clipboard";
import { FlintiaWindow } from "~/Flintia";
import Setting from "~/components/Setting";

const DESKTOP_DIR = await desktopDir();
export default function KeyFrameExtraction() {
    const [video, setVideo] = useState(String.empty);
    const [outdir, setOutdir] = useState(String.empty);

    const [copied, setCopied] = useState(false);

    return (
        <>
            <Setting title="KeyFrameExtractionVideo">
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
                    }).then(v => {
                        FlintiaWindow.getCurrentWindow().then(v => v.show());
                        if (v != null) setVideo(v);
                    });
                }}>{video ? Paths.getBasename(video) : "Browse..."}</button>
            </Setting>

            <Setting title="OutputDirectory">
                <button onClick={async () => {
                    await open({
                        defaultPath: DESKTOP_DIR,
                        directory: true,
                        title: "Output Directory"
                    }).then(v => {
                        FlintiaWindow.getCurrentWindow().then(v => v.show());
                        if (v != null) setOutdir(v);
                    });
                }}>{outdir ? outdir : "Browse..."}</button>
            </Setting>

            <button disabled={!video || !outdir} onClick={() => {
                Clipboards.copyText(`ffmpeg -i "${video}" -vf "select='eq(pict_type\,I)'" -vsync vfr -frame_pts true "${outdir}\\%03d.png"`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }}>{copied ? "コピーしました" : "クリックでコマンドをコピー"}</button>
        </>
    );
}
