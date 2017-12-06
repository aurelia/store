import { FrameworkConfiguration } from "aurelia-framework";
export declare function configure<T>(aurelia: FrameworkConfiguration, initialState: T, undoable?: boolean): void;
export * from "./store";
export * from "./test-helpers";
export * from "./history";
