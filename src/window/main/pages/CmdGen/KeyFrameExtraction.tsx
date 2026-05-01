import { useState } from "react";
import { Paths } from "~/util/path";
import { Clipboards } from "~/util/clipboard";
import { Setting } from "~/components/Setting";
import { Dialogs, VIDEO_EXTENSIONS } from "~/module/Dialogs";
import { DESKTOP_DIR } from "~/Data";
import { ifPresent } from "~/util/util";

export function KeyFrameExtraction() {
    const [video, setVideo] = useState(String.empty);
    const [outdir, setOutdir] = useState(String.empty);

    const [copied, setCopied] = useState(false);

    return (
        <>
            <Setting title="KeyFrameExtractionVideo">
                <button onClick={async () => {
                    const result = await Dialogs.openSingleFile("Select Video", [VIDEO_EXTENSIONS], DESKTOP_DIR);
                    if (result != null) setVideo(result);
                }}>{video ? Paths.getBasename(video) : "Browse..."}</button>
            </Setting>

            <Setting title="OutputDirectory">
                <button onClick={async () => {
                    const result = await Dialogs.openSingleDirectory("Output Direcotry", ifPresent(video, v => Paths.getDirectory(v)));
                    if (result != null) setOutdir(result);
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
