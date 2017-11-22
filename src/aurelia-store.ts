import { FrameworkConfiguration } from "aurelia-framework";
import { Store } from "./store";

export function configure<T>(
  aurelia: FrameworkConfiguration,
  initialState: T
) {
  aurelia.container
    .registerInstance(Store, new Store(initialState));
}

export * from "./store";
export * from "./test-helpers";
