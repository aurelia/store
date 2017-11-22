import { Store } from "./store";
export function configure(aurelia, initialState) {
    aurelia.container
        .registerInstance(Store, new Store(initialState));
}
export * from "./store";
export * from "./test-helpers";
