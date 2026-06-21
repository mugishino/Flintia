import { useState } from "react";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";
import { Setting } from "~/components/Setting";
import { Dialogs, IMAGE_EXTENSIONS } from "~/module/Dialogs";
import { DESKTOP_DIR } from "~/Data";
import { ifPresent } from "~/util/util";
import { Select } from "~/components/Select";

type Model =
    "RealESRGAN-x4plus-anime"
    |"RealESRGAN-x4plus"
    |"RealESR-animevideov3-x2"
    |"RealESR-animevideov3-x3"
    |"RealESR-animevideov3-x4"
;

const SelectData = new Map<Model, string>()
.set("RealESRGAN-x4plus-anime", "GAN x4Plus Anime")
.set("RealESRGAN-x4plus", "GAN x4Plus")
.set("RealESR-animevideov3-x2", "AnimeVideo x2")
.set("RealESR-animevideov3-x3", "AnimeVideo x3")
.set("RealESR-animevideov3-x4", "AnimeVideo x4")
;

export function RealEsrgan() {
    const [model, setModel] = useState<Model>("RealESRGAN-x4plus-anime");
    const [files, setFiles] = useState<string[]>([]);
    const [outdir, setOutdir] = useState<string|null>(null);

    const [copied, setCopied] = useState<string|null>(null);

    return (
        <>
            <Setting title="Model">
                <Select list={SelectData} select={model} onSelectChange={setModel}/>
            </Setting>

            <Setting title="Input Files">
                <button onClick={async () => {
                    const result = await Dialogs.openMultiFile("Select Images", [IMAGE_EXTENSIONS], DESKTOP_DIR);
                    if (result != null) setFiles(result);
                }}>Browse...</button>
            </Setting>
            {files.length == 0 ? null :
                <details>
                    <summary className="text-left pl-2">Selected File List</summary>
                    <div className="text-left min-h-1 wrap-break-word border">{files.map(f => Paths.getBasename(f)).join(", ")}</div>
                </details>
            }

            <Setting title="Output Directory">
                <button onClick={async () => {
                    const result = await Dialogs.openSingleDirectory("Select output directory", ifPresent(files, v => Paths.getDirectory(v[0])));
                    if (result != null) setOutdir(result);
                }}>{outdir ?? "Browse..."}</button>
            </Setting>

            <button onClick={() => {
                const cmd = files.map(f => {
                    const outFileName = Paths.splitExt(Paths.getBasename(f)).name;
                    return `realesrgan-ncnn-vulkan -i "${f}" -o "${outdir}/REG_${outFileName}.png" -n ${model}`;
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
