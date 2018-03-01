import { FrameworkConfiguration } from "aurelia-framework";
import { StoreOptions } from "./store";
export interface StorePluginOptions<T> extends StoreOptions {
    initialState: T;
}
export declare function configure<T>(aurelia: FrameworkConfiguration, options: Partial<StorePluginOptions<T>>): void;
export * from "./store";
export * from "./test-helpers";
export * from "./history";
export * from "./middleware";
export * from "./logging";
export * from "./decorator";
