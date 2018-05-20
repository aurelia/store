System.register(["aurelia-logging"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
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
    var aurelia_logging_1, LogLevel, LoggerIndexed;
    return {
        setters: [
            function (aurelia_logging_1_1) {
                aurelia_logging_1 = aurelia_logging_1_1;
            }
        ],
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
            LoggerIndexed = /** @class */ (function (_super) {
                __extends(LoggerIndexed, _super);
                function LoggerIndexed() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return LoggerIndexed;
            }(aurelia_logging_1.Logger));
            exports_1("LoggerIndexed", LoggerIndexed);
        }
    };
});
//# sourceMappingURL=logging.js.map