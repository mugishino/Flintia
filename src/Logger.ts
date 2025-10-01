export namespace Logger {
    export function error(text: string) {
        console.error(`[Flintia] ${text}`);
    }

    /**
     * Failed: text
     * @param text ログテキスト
     */
    export function failed(text: string) {
        console.error("Failed: " + text);
    }
}
