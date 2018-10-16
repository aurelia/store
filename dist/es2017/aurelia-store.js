import { Store } from "./store";
import { isStateHistory } from "./history";
export function configure(aurelia, options) {
    if (!options || !options.initialState) {
        throw new Error("initialState must be provided via options");
    }
    let initState = options.initialState;
    if (options && options.history && options.history.undoable && !isStateHistory(options.initialState)) {
        initState = { past: [], present: options.initialState, future: [] };
    }
    delete options.initialState;
    aurelia.container
        .registerInstance(Store, new Store(initState, options));
}
export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
export * from "./logging";
export * from "./decorator";
//# sourceMappingURL=aurelia-store.js.map