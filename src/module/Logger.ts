import { WInvoke } from "../InvokeWrapper";
import { IS_DEVELOP_MODE } from "../Data";

enum LogLevel {
    Trace   = 0,
    Debug   = 10,
    Info    = 20,
    Warning = 30,
    Error   = 40,
    Critical= 50,
}

let logCount = 1;

export namespace Logger {
    function print(type: string, text: string, level: LogLevel, color: string) {
        if (!IS_DEVELOP_MODE && level <= LogLevel.Debug) return;
        const time = new Date().format("HH:mm:SS.ss", 3);
        const logType = type.padEnd(5);
        const prefix = `[${logCount.toString().padStart(5)}][${time}][${logType}] `;
        const result = text.split("\n").map(v => String.space.repeat(prefix.length) + v).join("\n").trimStart();
        WInvoke.consoleLog(color + prefix + result + "\x1b[0m");
    }

    export function trace(msg: string) {
        print("TRACE", msg, LogLevel.Trace, "\x1b[32m");
    }

    export function debug(msg: string) {
        print("DEBUG", msg, LogLevel.Debug, "\x1b[30m");
    }

    export function info(msg: string) {
        print("INFO", msg, LogLevel.Info, "\x1b[37m");
    }

    export function warning(msg: string) {
        print("WARN", msg, LogLevel.Debug, "\x1b[33m");
    }

    export function error(text: string) {
        print("ERROR", text, LogLevel.Error, "\x1b[31m");
    }

    export function critical(msg: string) {
        print("CRIT", msg, LogLevel.Critical, "\x1b[41m");
    }



    function tracePrint(err: Error, func: (msg: string) => void) {
        (func == warning ? console.warn : console.error)(`[${logCount}] ${name}: ${err.message}`);
        const trace = (err.stack ?? String.empty).split("\n").slice(2);
        func([`${err}`, ...trace].join("\n"));
    }

    export function warningTrace(msg: string) {
        tracePrint(new Error(msg), warning);
    }

    export function errorTrace(msg: string) {
        tracePrint(new Error(msg), error);
    }

    export function criticalTrace(msg: string) {
        tracePrint(new Error(msg), critical);
    }
}
