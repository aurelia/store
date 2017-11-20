import { Store } from "./store";
// import { PLATFORM } from "aurelia-pal";
export function configure(aurelia, initialState) {
    aurelia.container
        .registerInstance(Store, new Store(initialState));
}
export * from "./store";
