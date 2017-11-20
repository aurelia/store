define(["require", "exports", "./store", "./store"], function (require, exports, store_1, store_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    // import { PLATFORM } from "aurelia-pal";
    function configure(aurelia, initialState) {
        aurelia.container
            .registerInstance(store_1.Store, new store_1.Store(initialState));
    }
    exports.configure = configure;
    __export(store_2);
});
