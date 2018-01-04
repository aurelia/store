define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LogLevel;
    (function (LogLevel) {
        LogLevel["trace"] = "trace";
        LogLevel["debug"] = "debug";
        LogLevel["info"] = "info";
        LogLevel["log"] = "log";
        LogLevel["warn"] = "warn";
        LogLevel["error"] = "error";
    })(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
    function getLogType(options, definition, defaultLevel) {
        if (definition &&
            options.logDefinitions &&
            options.logDefinitions.hasOwnProperty(definition) &&
            options.logDefinitions[definition] &&
            Object.values(LogLevel).includes(options.logDefinitions[definition])) {
            return options.logDefinitions[definition];
        }
        return defaultLevel;
    }
    exports.getLogType = getLogType;
});
