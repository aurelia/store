define(["require", "exports", "./store", "./store", "./test-helpers"], function (require, exports, store_1, store_2, test_helpers_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(aurelia, initialState) {
        aurelia.container
            .registerInstance(store_1.Store, new store_1.Store(initialState));
    }
    exports.configure = configure;
    __export(store_2);
    __export(test_helpers_1);
});
