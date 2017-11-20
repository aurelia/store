"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("./store");
// import { PLATFORM } from "aurelia-pal";
function configure(aurelia, initialState) {
    aurelia.container
        .registerInstance(store_1.Store, new store_1.Store(initialState));
}
exports.configure = configure;
__export(require("./store"));
