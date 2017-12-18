System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function logMiddleware(state) {
        console.log("New state: ", state);
    }
    exports_1("logMiddleware", logMiddleware);
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
