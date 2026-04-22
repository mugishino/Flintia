import { useState } from "react";
import { Clipboards } from "~/util/clipboard";
import * as mkqr from "qrcode";
import { EvenlyDividedRow } from "~/components/EvenlyDividedRow";
import { readClipboardQRCode } from "~/module/QRCode";

export function QRCode() {
    const [result, setResult] = useState<string|null>(null);
    const [success, setSuccess] = useState(true);

    async function readFromClipboard() {
        const read = await readClipboardQRCode();
        setSuccess(!read.isErr);
        read.map_err(e => setResult(e))
            .map    (r => setResult(r));
    }

    async function createFromClipboard() {
        setSuccess(false);
        const canvas = document.createElement("canvas");
        const text = await navigator.clipboard.readText();
        if (text.length == 0) return setResult("QRコード生成には文字列が必要です");

        mkqr.toCanvas(canvas, text);
        if (await Clipboards.copyFromCanvas(canvas)) {
            setResult("生成したQRコードをコピーしました");
            setSuccess(true);
        }
    }

    return (
        <>
            <EvenlyDividedRow>
                <button onClick={readFromClipboard} className="border-0 border-b">Read from clipboard</button>
                <button onClick={createFromClipboard} className="border-0 border-b border-l">Create from clipboard</button>
            </EvenlyDividedRow>
            <div className={`grow text-center select-text wrap-break-words ${success ? "text-text" : "text-fail"}`}>{(() => {
                if (result == null) return null;
                if (URL.canParse(result)) {
                    return <a href={result} target="_blank" className="text-link underline">{result}</a>
                }
                return result;
            })()}</div>
        </>
    );
}
