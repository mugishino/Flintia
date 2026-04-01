import { useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import jsQR from "jsqr";
import { Clipboards } from "~/util/clipboard";
import * as mkqr from "qrcode";
import EvenlyDividedRow from "~/components/EvenlyDividedRow";
import { createCanvas } from "~/util/util";

async function tryZxing(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const reader = new BrowserQRCodeReader();
    try {
        const decoded = await reader.decodeFromImageUrl(url);
        return decoded.getText();
    } catch {
        return null;
    }
}

async function tryJsqr(blob: Blob) {
    const bmp = await createImageBitmap(blob);

    const {ctx, canvas} = createCanvas(bmp.width, bmp.height);
    if (ctx == null) return null;
    ctx.drawImage(bmp, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(data.data, data.width, data.height);
    return qr?.data ?? null;
}

export default function QRCode() {
    const [result, setResult] = useState<string|null>(null);
    const [success, setSuccess] = useState(true);

    async function readFromClipboard() {
        setSuccess(false);
        const blob = await Clipboards.getImageBlob();
        if (blob == null) return setResult("クリップボードが画像ではありません");

        const qrdata = await tryZxing(blob) ?? await tryJsqr(blob);
        if (qrdata == null) return setResult("QRコードを読み取れませんでした");
        setResult(qrdata);
        setSuccess(true);
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
