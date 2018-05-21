import { StoreOptions } from "./store";
import { Logger } from "aurelia-logging";
export declare enum LogLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    log = "log",
    warn = "warn",
    error = "error",
}
export declare class LoggerIndexed extends Logger {
    [key: string]: any;
}
export interface LogDefinitions {
    performanceLog?: LogLevel;
    dispatchedActions?: LogLevel;
    devToolsStatus?: LogLevel;
}
export declare function getLogType(options: Partial<StoreOptions>, definition: keyof LogDefinitions, defaultLevel: LogLevel): LogLevel;
