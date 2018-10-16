define(["require", "exports", "./store", "./history", "./store", "./test-helpers", "./history", "./middleware", "./logging", "./decorator"], function (require, exports, store_1, history_1, store_2, test_helpers_1, history_2, middleware_1, logging_1, decorator_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
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
    exports.configure = configure;
    __export(store_2);
    __export(test_helpers_1);
    __export(history_2);
    __export(middleware_1);
    __export(logging_1);
    __export(decorator_1);
});
//# sourceMappingURL=aurelia-store.js.map