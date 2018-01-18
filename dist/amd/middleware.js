define(["require", "exports"], function (require, exports) {
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
    function localStorageMiddleware(state) {
        if (window.localStorage) {
            window.localStorage.setItem("aurelia-store-state", JSON.stringify(state));
        }
    }
    exports.localStorageMiddleware = localStorageMiddleware;
    function rehydrateFromLocalStorage(state) {
        if (!window.localStorage) {
            return state;
        }
        var storedState = window.localStorage.getItem("aurelia-store-state");
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
});
//# sourceMappingURL=middleware.js.map