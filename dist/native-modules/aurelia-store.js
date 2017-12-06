import { Store } from "./store";
export function configure(aurelia, initialState, undoable) {
    if (undoable === void 0) { undoable = false; }
    aurelia.container
        .registerInstance(Store, new Store(initialState, undoable));
}
export * from "./store";
export * from "./test-helpers";
export * from "./history";
