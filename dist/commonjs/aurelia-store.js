"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
var history_1 = require("./history");
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
__export(require("./store"));
__export(require("./test-helpers"));
__export(require("./history"));
__export(require("./middleware"));
__export(require("./logging"));
__export(require("./decorator"));
//# sourceMappingURL=aurelia-store.js.map