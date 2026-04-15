import { BrowserQRCodeReader } from "@zxing/browser";
import jsQR from "jsqr";
import { Result } from "~/util/clazz";
import { Clipboards } from "~/util/clipboard";
import { createCanvas } from "~/util/util";

/**
 * QRコードの読み取りを試行します。
 * @returns 読み取り結果。失敗した場合null
 */
export async function readClipboardQRCode(): Promise<Result<string, string>> {
    const blob = await Clipboards.getImageBlob();
    if (blob == null) return Result.Err("クリップボードが画像ではありません");

    const qrdata = await tryZxing(blob) ?? await tryJsqr(blob);
    if (qrdata == null) return Result.Err("QRコードを読み取れませんでした");

    return Result.Ok(qrdata);
}

/**
 * Zxingを使用し、QRコードの読み取りを試します。
 * @param blob QRコード画像のBlob
 * @returns 読み取り結果。失敗した場合null
 */
export async function tryZxing(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const reader = new BrowserQRCodeReader();
    try {
        const decoded = await reader.decodeFromImageUrl(url);
        return decoded.getText();
    } catch {
        return null;
    }
}

/**
 * JSQRを使用し、QRコードの読み取りを試します。
 * @param blob QRコード画像のBlob
 * @returns 読み取り結果。失敗した場合null
 */
export async function tryJsqr(blob: Blob) {
    const bmp = await createImageBitmap(blob);

    const {ctx, canvas} = createCanvas(bmp.width, bmp.height);
    if (ctx == null) return null;
    ctx.drawImage(bmp, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(data.data, data.width, data.height);
    return qr?.data ?? null;
}
