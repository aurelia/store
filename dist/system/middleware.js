System.register(["aurelia-pal"], function (exports_1, context_1) {
    "use strict";
    var aurelia_pal_1, MiddlewarePlacement;
    var __moduleName = context_1 && context_1.id;
    function logMiddleware(state, _, settings) {
        if (settings && settings.logType && console.hasOwnProperty(settings.logType)) {
            console[settings.logType]("New state: ", state);
        }
        else {
            console.log("New state: ", state);
        }
    }
    exports_1("logMiddleware", logMiddleware);
    function localStorageMiddleware(state, _, settings) {
        if (aurelia_pal_1.PLATFORM.global.localStorage) {
            var key = settings && settings.key && typeof settings.key === "string"
                ? settings.key
                : "aurelia-store-state";
            aurelia_pal_1.PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
        }
    }
    exports_1("localStorageMiddleware", localStorageMiddleware);
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
    exports_1("rehydrateFromLocalStorage", rehydrateFromLocalStorage);
    return {
        setters: [
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            }
        ],
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