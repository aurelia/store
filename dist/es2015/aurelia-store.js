import { Store } from "./store";
export function configure(aurelia, initialState, options) {
    aurelia.container
        .registerInstance(Store, new Store(initialState, options));
}
export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
