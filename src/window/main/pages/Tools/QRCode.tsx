import { useState } from "react";
import * as mkqr from "qrcode";
import { EvenlyDividedRow } from "~/components/EvenlyDividedRow";
import { readClipboardQRCode } from "~/module/QRCode";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { BUTTON_MSG_TIMEOUT } from "~/Data";
import { Clipboards } from "~/util/clipboard";
import { openUrl } from "@tauri-apps/plugin-opener";

export function QRCode() {
    const [overlay, setOverlay] = useState(false);

    const [resultText, setResultText] = useState<string|undefined>(undefined);
    const [qrImgBlob, setQrImgBlob] = useState<Blob|undefined>(undefined);

    const [createFailMsg, setCreateFailMsg] = useState<string|undefined>(undefined);
    const [readFailMsg, setReadFailMsg] = useState<string|undefined>(undefined);

    function openOverlay(text: string|undefined, imgBlob: Blob|undefined) {
        setResultText(text);
        setQrImgBlob(imgBlob);
        setOverlay(true);
    }

    async function readFromClipboard() {
        (await readClipboardQRCode())
        .onSuccess(r => openOverlay(r, undefined))
        .onFailure(() => {
            setTimeout(() => setReadFailMsg(undefined), BUTTON_MSG_TIMEOUT);
            setReadFailMsg("失敗または画像が必要");
        });
    }

    async function createFromClipboard() {
        // クリップボードからテキストを取得
        const text = await navigator.clipboard.readText();
        if (text.length == 0) {
            setTimeout(() => setCreateFailMsg(undefined), BUTTON_MSG_TIMEOUT);
            setCreateFailMsg("生成には文字列が必要です");
            return;
        }

        // 画像生成
        const canvas = document.createElement("canvas");
        mkqr.toCanvas(canvas, text);
        canvas.toBlob(blob => openOverlay(undefined, blob??undefined), "image/png");
    }

    return (
        <>
            <EvenlyDividedRow>
                <button onClick={readFromClipboard} className={"text-fail".where(!!readFailMsg)}>{readFailMsg ?? "Read from clipboard"}</button>
                <button onClick={createFromClipboard} className={"text-fail".where(!!createFailMsg)}>{createFailMsg ?? "Create from clipboard"}</button>
            </EvenlyDividedRow>

            <Overlay show={overlay} setShow={setOverlay}>
                <OverlayWindow className="max-w-3/4 max-h-4/5">
                    <div className="text-center select-text whitespace-pre text-text overflow-scroll">{(() => {
                        if (resultText == undefined) return;
                        if (URL.canParse(resultText)) return <span className="text-link underline cursor-pointer" onClick={() => openUrl(resultText)}>{resultText}</span>;
                        return resultText;
                    })()}</div>

                    <img className="[image-rendering:pixelated]" src={qrImgBlob && URL.createObjectURL(qrImgBlob)}/>
                    <button onClick={async() => {
                        setOverlay(false);
                        // 画像がある場合はQR生成なのでそちらをコピー
                        if (qrImgBlob) {
                            const item = new ClipboardItem({"image/png": qrImgBlob });
                            await navigator.clipboard.write([item]);
                        }
                        // ない場合は読み取りなのでテキストコピー
                        else {
                            if (resultText) Clipboards.copyText(resultText);
                        }
                    }}>Copy and close</button>
                </OverlayWindow>
            </Overlay>
        </>
    );
}
