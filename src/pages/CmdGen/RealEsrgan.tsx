import { desktopDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { Clipboards } from "~/util/clipboard";
import { Flintia } from "~/Flintia";
import { Paths } from "~/util/path";
import Setting from "~/components/Setting";

const Model = {
    "GAN x4Plus Anime": "RealESRGAN-x4plus-anime",
    "GAN x4Plus": "RealESRGAN-x4plus",
    "AnimeVideo x2": "RealESR-animevideov3-x2",
    "AnimeVideo x3": "RealESR-animevideov3-x3",
    "AnimeVideo x4": "RealESR-animevideov3-x4",
} as const;

const DESKTOP_DIR = await desktopDir();
export default function RealEsrgan() {
    const [model, setModel] = useState<keyof typeof Model>("GAN x4Plus Anime");
    const [files, setFiles] = useState<string[]>([]);
    const [outdir, setOutdir] = useState<string|null>(null);

    const [copied, setCopied] = useState<string|null>(null);

    return (
        <>
            <Setting title="Model">
                <select value={model} onChange={e => setModel(e.currentTarget.value as keyof typeof Model)}>
                    {Object.keys(Model).map(v => <option key={v}>{v}</option>)}
                </select>
            </Setting>

            <Setting title="Input Files">
                <button onClick={async () => {
                    await open({
                        defaultPath: DESKTOP_DIR,
                        filters: [{
                            "name": "Image",
                            "extensions": ["png", "webp", "jpg", "jpeg", "tif", "tiff", "avif"]
                        }],
                        title: "Select Images",
                        multiple: true,
                    }).then(async v => {
                        await Flintia.show();
                        if (v != null) setFiles(v);
                    });
                }}>Browse...</button>
            </Setting>
            {files.length == 0 ? null :
                <details>
                    <summary className="text-left pl-2">Selected File List</summary>
                    <div className="text-left min-h-1 wrap-break-word border-1">{files.map(f => Paths.getBasename(f)).join(", ")}</div>
                </details>
            }

            <Setting title="Output Directory">
                <button onClick={async () => {
                    await open({
                        defaultPath: DESKTOP_DIR,
                        directory: true,
                        multiple: false,
                        title: "Select Output Directory"
                    }).then(async v => {
                        await Flintia.show();
                        if (v != null) setOutdir(v);
                    });
                }}>{outdir ?? "Browse..."}</button>
            </Setting>

            <button onClick={() => {
                const cmd = files.map(f => {
                    const outFileName = Paths.splitExt(Paths.getBasename(f)).name;
                    return `realesrgan-ncnn-vulkan -i "${f}" -o "${outdir}/REG_${outFileName}.png" -n ${Model[model]}`;
                }).join("&");
                Clipboards.copyText(cmd);
                // コピー通知、コマンド長が8192を超えてれば長めに出す
                const over8192 = cmd.length > 8191;
                setCopied("Copied!" + (over8192 ? " Command length exceeds 8192" : String.empty));
                setTimeout(() => setCopied(null), over8192 ? 3000 : 1000);
            }} disabled={!files || !outdir}>{copied ?? "Copy Command"}</button>
        </>
    );
}
