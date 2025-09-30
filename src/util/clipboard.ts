import { WInvoke } from "../InvokeWrapper";

export function copyText(text: string|number, paste: boolean=false) {
    navigator.clipboard.writeText(text.toString());
    if (paste) {
        WInvoke.hide();
        WInvoke.paste();
    }
}

/**
 * ClipboardItemが画像か判定します。
 * @param item 判定するClipboardItem
 * @returns 画像のMIMEタイプ, 画像でなければundefined
 */
export function getImageMimeByClipboardImage(item: ClipboardItem) {
    const itemType = item.types.find(t => [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/tiff",
        "image/bmp",
    ].includes(t));
    return itemType;
}

/**
 * クリップボードの画像をBlobで取得します。
 * @returns 失敗した場合nullが返ります。
 */
export async function getClipboardImageBlob() {
    const item = (await navigator.clipboard.read())[0];
    const mime = getImageMimeByClipboardImage(item);
    if (!mime) return null;
    return await item.getType(mime);
}

/**
 * canvasの画像をクリップボードにコピーします。
 * @param canvas コピーするcanvas
 * @returns 成功した場合true
 */
export async function canvasToClipboard(canvas: HTMLCanvasElement) {
    canvas.toBlob(async blob => {
        if (blob == null) return false;
        await navigator.clipboard.write([
            new ClipboardItem({"image/png": blob})
        ]);
    });
    return true;
}
