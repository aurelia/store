import { FrameworkConfiguration } from "aurelia-framework";
import { StoreOptions } from "./store";
export declare function configure<T>(aurelia: FrameworkConfiguration, initialState: T, options?: Partial<StoreOptions>): void;
export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
