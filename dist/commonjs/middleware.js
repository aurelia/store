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
function localStorageMiddleware(state, _, settings) {
    if (window.localStorage) {
        var key = settings && settings.key && typeof settings.key === "string"
            ? settings.key
            : "aurelia-store-state";
        window.localStorage.setItem(key, JSON.stringify(state));
    }
}
exports.localStorageMiddleware = localStorageMiddleware;
function rehydrateFromLocalStorage(state, key) {
    if (!window.localStorage) {
        return state;
    }
    var storedState = window.localStorage.getItem(key || "aurelia-store-state");
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