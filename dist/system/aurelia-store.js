System.register(["./store", "./test-helpers"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia, initialState, undoable) {
        if (undoable === void 0) { undoable = false; }
        aurelia.container
            .registerInstance(store_1.Store, new store_1.Store(initialState, undoable));
    }
    exports_1("configure", configure);
    var store_1;
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
            function (test_helpers_1_1) {
                exportStar_1(test_helpers_1_1);
            }
        ],
        execute: function () {
        }
    };
});
