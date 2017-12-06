import { FrameworkConfiguration } from "aurelia-framework";
import { Store } from "./store";

export function configure<T>(
  aurelia: FrameworkConfiguration,
  initialState: T,
  undoable: boolean = false
) {
  aurelia.container
    .registerInstance(Store, new Store(initialState, undoable));
}

export * from "./store";
export * from "./test-helpers";
export * from "./history";
