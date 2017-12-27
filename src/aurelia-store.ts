import { FrameworkConfiguration } from "aurelia-framework";
import { Store, StoreOptions } from "./store";
import { isStateHistory } from "./history";

export function configure<T>(
  aurelia: FrameworkConfiguration,
  initialState: T,
  options?: Partial<StoreOptions>
) {
  let initState: any = initialState;
  if (options && options.history && options.history.undoable && !isStateHistory(initialState)) {
    initState =  { past: [], present: initialState, future: [] };
  }

  aurelia.container
    .registerInstance(Store, new Store(initState, options));
}

export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
