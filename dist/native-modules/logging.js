export var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["log"] = "log";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel || (LogLevel = {}));
export function getLogType(options, definition, defaultLevel) {
    if (definition &&
        options.logDefinitions &&
        options.logDefinitions.hasOwnProperty(definition) &&
        options.logDefinitions[definition] &&
        Object.values(LogLevel).includes(options.logDefinitions[definition])) {
        return options.logDefinitions[definition];
    }
    return defaultLevel;
}
//# sourceMappingURL=logging.js.map