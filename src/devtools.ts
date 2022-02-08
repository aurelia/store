export interface Action<T = any> {
  type: T;
  params?: any[];
}

export interface ActionCreator<T> {
  (...args: any[]): T;
}

export type DevToolsOptions = import("@redux-devtools/extension").EnhancerOptions | { disable: boolean };
