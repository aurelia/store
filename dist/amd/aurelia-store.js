define(["require", "exports", "./store", "./history", "./store", "./test-helpers", "./history", "./middleware"], function (require, exports, store_1, history_1, store_2, test_helpers_1, history_2, middleware_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(aurelia, initialState, options) {
        var initState = initialState;
        if (options && options.history && options.history.undoable && !history_1.isStateHistory(initialState)) {
            initState = { past: [], present: initialState, future: [] };
        }
        aurelia.container
            .registerInstance(store_1.Store, new store_1.Store(initState, options));
    }
    exports.configure = configure;
    __export(store_2);
    __export(test_helpers_1);
    __export(history_2);
    __export(middleware_1);
});
