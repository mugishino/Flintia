import { WInvoke } from "../InvokeWrapper";
import { IS_DEVELOP_MODE } from "../Data";
import { getCurrentWindow } from "@tauri-apps/api/window";

enum LogLevel {
    Trace   = 0,
    Debug   = 10,
    Info    = 20,
    Warning = 30,
    Error   = 40,
    Critical= 50,
}

let logCount = 1;

export class Logger {
    private static print(type: string, text: string, level: LogLevel, color: string) {
        if (!IS_DEVELOP_MODE && level <= LogLevel.Debug) return;
        const time = new Date().format("HH:mm:SS.ss", 3);
        const logType = type.padEnd(5);
        const prefix = `[${logCount.toString().padStart(5)}][${time}][${logType}] `;
        const result = text.split("\n").map(v => String.space.repeat(prefix.length) + v).join("\n").trimStart();
        WInvoke.consoleLog(color + prefix + result + "\x1b[0m");
        
        switch (level) {
            case LogLevel.Trace     : return console.trace(prefix + result);
            case LogLevel.Debug     : return console.debug(prefix + result);
            case LogLevel.Info      : return console.info (prefix + result);
            case LogLevel.Warning   : return console.warn (prefix + result);
            case LogLevel.Error     : return console.error(prefix + result);
            case LogLevel.Critical  : return console.error(prefix + result);
        }
    }

    public static trace(msg: string) {
        this.print("TRACE", msg, LogLevel.Trace, "\x1b[32m");
    }

    public static debug(msg: string) {
        this.print("DEBUG", msg, LogLevel.Debug, "\x1b[30m");
    }

    public static info(msg: string) {
        this.print("INFO", msg, LogLevel.Info, "\x1b[37m");
    }

    public static warning(msg: string) {
        this.print("WARN", msg, LogLevel.Debug, "\x1b[33m");
    }

    public static error(text: string) {
        this.print("ERROR", text, LogLevel.Error, "\x1b[31m");
    }

    public static critical(msg: string) {
        this.print("CRIT", msg, LogLevel.Critical, "\x1b[41m");
    }



    private static tracePrint(err: Error, func: (msg: string) => void) {
        const windowLabel = getCurrentWindow().label;
        (func == Logger.warning ? console.warn : console.error)(`[${logCount}] ${windowLabel}: ${err.message}`);
        const trace = (err.stack ?? String.empty).split("\n").slice(2);
        func([`${err}`, ...trace].join("\n"));
    }

    public static warningTrace(msg: string) {
        this.tracePrint(new Error(msg), this.warning);
    }

    public static errorTrace(msg: string) {
        this.tracePrint(new Error(msg), this.error);
    }

    public static criticalTrace(msg: string) {
        this.tracePrint(new Error(msg), this.critical);
    }
}
