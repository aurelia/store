import { FrameworkConfiguration } from "aurelia-framework";
import { Store, StoreOptions } from "./store";
import { isStateHistory } from "./history";

export interface StorePluginOptions<T> extends StoreOptions {
  initialState: T;
}

export function configure<T>(
  aurelia: FrameworkConfiguration,
  options: Partial<StorePluginOptions<T>>
) {
  if (!options || !options.initialState) {
    throw new Error("initialState must be provided via options");
  }

  let initState: any = options.initialState;
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
