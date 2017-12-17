"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement = exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));
function logMiddleware(state) {
    console.log("New state: ", state);
}
exports.logMiddleware = logMiddleware;
