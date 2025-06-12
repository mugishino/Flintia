import { useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import jsQR from "jsqr";

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

    const canvas  = document.createElement("canvas");
    canvas.width  = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (ctx == null) return null;
    ctx.drawImage(bmp, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(data.data, data.width, data.height);
    return qr?.data ?? null;
}

export default function QRCode() {
    const [result, setResult] = useState<string|null>(null);
    const [success, setSuccess] = useState(true);

    return (
        <>
            <button onClick={async () => {
                setSuccess(false);
                const item = (await navigator.clipboard.read())[0];
                const itemType = item.types.find(t => [
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "image/tiff",
                    "image/bmp",
                ].includes(t));
                if (!itemType) return setResult("クリップボードが画像ではありません");

                const blob = await item.getType(itemType);
                const qrdata = await tryZxing(blob) ?? await tryJsqr(blob);
                if (qrdata == null) {
                    setResult("QRコードを読み取れませんでした");
                } else {
                    setResult(qrdata);
                    setSuccess(true);
                }
            }} className="bg-layerB border-b-1 border-border hover:bg-layerC cursor-pointer">Read from clipboard</button>
            <div className={`grow text-center select-text break-words ${success ? "text-white" : "text-fail"}`}>{(() => {
                if (result == null) return null;
                if (URL.canParse(result)) {
                    return <a href={result} target="_blank" className="text-link underline">{result}</a>
                }
                return result;
            })()}</div>
        </>
    );
}
