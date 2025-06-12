import { useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

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
                const url = URL.createObjectURL(blob);

                const reader = new BrowserQRCodeReader();
                try {
                    const decoded = await reader.decodeFromImageUrl(url);
                    setResult(decoded.getText());
                    setSuccess(true);
                } catch {
                    setResult("QRコードを読み取れませんでした");
                }
            }} className="bg-neutral-800 border-b-1 border-neutral-500 hover:bg-neutral-700 cursor-pointer">Read from clipboard</button>
            <div className={`grow text-center select-text ${success ? "text-white" : "text-red-400"}`}>{(() => {
                if (result == null) return null;
                if (URL.canParse(result)) {
                    return <a href={result} target="_blank" className="text-blue-500 underline">{result}</a>
                }
                return result;
            })()}</div>
        </>
    );
}
