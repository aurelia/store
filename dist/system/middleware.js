System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function logMiddleware(state) {
        console.log("New state: ", state);
    }
    exports_1("logMiddleware", logMiddleware);
    function localStorageMiddleware(state, _, settings) {
        if (window.localStorage) {
            var key = settings && settings.key && typeof settings.key === "string"
                ? settings.key
                : "aurelia-store-state";
            window.localStorage.setItem(key, JSON.stringify(state));
        }
    }
    exports_1("localStorageMiddleware", localStorageMiddleware);
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
    exports_1("rehydrateFromLocalStorage", rehydrateFromLocalStorage);
    var MiddlewarePlacement;
    return {
        setters: [],
        execute: function () {
            (function (MiddlewarePlacement) {
                MiddlewarePlacement["Before"] = "before";
                MiddlewarePlacement["After"] = "after";
            })(MiddlewarePlacement || (MiddlewarePlacement = {}));
            exports_1("MiddlewarePlacement", MiddlewarePlacement);
        }
    };
});
//# sourceMappingURL=middleware.js.map