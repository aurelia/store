System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    exports_1("getLogType", getLogType);
    var LogLevel;
    return {
        setters: [],
        execute: function () {
            (function (LogLevel) {
                LogLevel["trace"] = "trace";
                LogLevel["debug"] = "debug";
                LogLevel["info"] = "info";
                LogLevel["log"] = "log";
                LogLevel["warn"] = "warn";
                LogLevel["error"] = "error";
            })(LogLevel || (LogLevel = {}));
            exports_1("LogLevel", LogLevel);
        }
    };
});
//# sourceMappingURL=logging.js.map