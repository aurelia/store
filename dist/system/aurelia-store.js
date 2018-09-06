System.register(["./store", "./history", "./test-helpers", "./middleware", "./logging", "./decorator"], function (exports_1, context_1) {
    "use strict";
    var store_1, history_1;
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia, options) {
        if (!options || !options.initialState) {
            throw new Error("initialState must be provided via options");
        }
        var initState = options.initialState;
        if (options && options.history && options.history.undoable && !history_1.isStateHistory(options.initialState)) {
            initState = { past: [], present: options.initialState, future: [] };
        }
        delete options.initialState;
        aurelia.container
            .registerInstance(store_1.Store, new store_1.Store(initState, options));
    }
    exports_1("configure", configure);
    var exportedNames_1 = {
        "configure": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (store_1_1) {
                store_1 = store_1_1;
                exportStar_1(store_1_1);
            },
            function (history_1_1) {
                history_1 = history_1_1;
                exportStar_1(history_1_1);
            },
            function (test_helpers_1_1) {
                exportStar_1(test_helpers_1_1);
            },
            function (middleware_1_1) {
                exportStar_1(middleware_1_1);
            },
            function (logging_1_1) {
                exportStar_1(logging_1_1);
            },
            function (decorator_1_1) {
                exportStar_1(decorator_1_1);
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=aurelia-store.js.map