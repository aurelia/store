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
define(["require", "exports", "aurelia-logging"], function (require, exports, aurelia_logging_1) {
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
    var LoggerIndexed = /** @class */ (function (_super) {
        __extends(LoggerIndexed, _super);
        function LoggerIndexed() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return LoggerIndexed;
    }(aurelia_logging_1.Logger));
    exports.LoggerIndexed = LoggerIndexed;
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
//# sourceMappingURL=logging.js.map