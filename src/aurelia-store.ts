import { FrameworkConfiguration } from "aurelia-framework";
import { Store, StoreOptions } from "./store";

export function configure<T>(
  aurelia: FrameworkConfiguration,
  initialState: T,
  options?: Partial<StoreOptions>
) {
  aurelia.container
    .registerInstance(Store, new Store(initialState, options));
}

export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
