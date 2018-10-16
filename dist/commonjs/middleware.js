"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_pal_1 = require("aurelia-pal");
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement = exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));
function logMiddleware(state, _, settings) {
    if (settings && settings.logType && console.hasOwnProperty(settings.logType)) {
        console[settings.logType]("New state: ", state);
    }
    else {
        console.log("New state: ", state);
    }
}
exports.logMiddleware = logMiddleware;
function localStorageMiddleware(state, _, settings) {
    if (aurelia_pal_1.PLATFORM.global.localStorage) {
        var key = settings && settings.key && typeof settings.key === "string"
            ? settings.key
            : "aurelia-store-state";
        aurelia_pal_1.PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
    }
}
exports.localStorageMiddleware = localStorageMiddleware;
function rehydrateFromLocalStorage(state, key) {
    if (!aurelia_pal_1.PLATFORM.global.localStorage) {
        return state;
    }
    var storedState = aurelia_pal_1.PLATFORM.global.localStorage.getItem(key || "aurelia-store-state");
    if (!storedState) {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch (e) { }
    return state;
}
exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;
//# sourceMappingURL=middleware.js.map