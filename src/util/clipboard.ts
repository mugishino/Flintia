import { WInvoke } from "../InvokeWrapper";

export class Clipboards {
    /**
     * テキストをコピーします。
     * @param text コピーするテキスト
     * @param paste 貼り付ける
     */
    public static copyText(text: string|number, paste: boolean=false) {
        navigator.clipboard.writeText(text.toString());
        if (paste) {
            WInvoke.paste();
        }
    }

    /**
     * ClipboardItemが画像か判定します。
     * @param item 判定するClipboardItem
     * @returns 画像のMIMEタイプ, 画像でなければundefined
     */
    public static isImage(item: ClipboardItem) {
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
    public static async getImageBlob() {
        const item = (await navigator.clipboard.read())[0];
        const mime = Clipboards.isImage(item);
        if (!mime) return null;
        return await item.getType(mime);
    }

    /**
     * canvasの画像をクリップボードにコピーします。
     * @param canvas コピーするcanvas
     * @returns 成功した場合true
     */
    public static async copyFromCanvas(canvas: HTMLCanvasElement) {
        // toBlobを待たずにclipboardを使おうとするとエラーが出ます
        const blob: Blob|null = await new Promise(resolve => {
            canvas.toBlob(async blob => resolve(blob));
        });

        if (blob == null) return false;
        await navigator.clipboard.write([
            new ClipboardItem({"image/png": blob})
        ]);
        return true;
    }
}
