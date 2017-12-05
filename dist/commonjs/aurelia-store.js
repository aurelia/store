"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
function configure(aurelia, initialState, undoable) {
    if (undoable === void 0) { undoable = false; }
    aurelia.container
        .registerInstance(store_1.Store, new store_1.Store(initialState, undoable));
}
exports.configure = configure;
__export(require("./store"));
__export(require("./test-helpers"));
