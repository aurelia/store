var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Logger } from "aurelia-logging";
export var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["log"] = "log";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel || (LogLevel = {}));
var LoggerIndexed = /** @class */ (function (_super) {
    __extends(LoggerIndexed, _super);
    function LoggerIndexed() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return LoggerIndexed;
}(Logger));
export { LoggerIndexed };
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