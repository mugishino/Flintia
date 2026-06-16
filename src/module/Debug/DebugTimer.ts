import { Logger } from "../Logger";

export class DebugTimer {
    private start = Date.now();
    private lastPrint = Date.now();

    public printTime(tag?: string) {
        const now = Date.now();
        Logger.debug(`ElapsedTime: Init=${now - this.start}ms, LastPrint=${now - this.lastPrint}ms    ${tag ?? String.empty}`);
        this.lastPrint = now;
    }

    public reset() {
        this.start = this.lastPrint = Date.now();
    }
}
