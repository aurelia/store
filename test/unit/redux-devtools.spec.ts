import { DevToolsOptions } from "./../../src/store";
import { skip, delay } from "rxjs/operators";

import {
  createTestStore,
  testState
} from "./helpers";
import { Store } from "../../src/store";
import * as PAL from "aurelia-pal";

class DevToolsMock {
  public subscriptions = [] as Function[];
  public init = jest.fn();
  public subscribe = jest.fn().mockImplementation((cb: (message: any) => void) => this.subscriptions.push(cb));

  constructor(public devToolsOptions: DevToolsOptions) {}
}

function createDevToolsMock() {
  PAL.PLATFORM.global.devToolsExtension = {};
  PAL.PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__ = {
    connect: (devToolsOptions?: DevToolsOptions) => new DevToolsMock(devToolsOptions!)
  }
}

describe("redux devtools", () => {

  beforeEach(() => {
    delete PAL.PLATFORM.global.devToolsExtension;
  });

  it("should setup devtools on construction", () => {
    const spy = jest.spyOn(Store.prototype as any, "setupDevTools");
    new Store<testState>({ foo: "bar " });

    expect(spy).toHaveBeenCalled();
    spy.mockReset();
    spy.mockRestore();
  });

  it("should init devtools if available", () => {
    createDevToolsMock();
    const store = new Store<testState>({ foo: "bar " });

    expect((store as any).devToolsAvailable).toBe(true);
    expect((store as any).devTools.init).toHaveBeenCalled();
  });

  it("should use DevToolsOptions if available", () => {
    createDevToolsMock();
    const store = new Store<testState>({ foo: "bar " }, { devToolsOptions: { serialize: false } });

    expect((store as any).devTools.devToolsOptions).toBeDefined();
  });

  it("should receive time-travel notification from devtools", () => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: "bar " });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({ state: JSON.stringify({ foo: expectedStateChange }) });

    expect(devtools.subscribe).toHaveBeenCalled();
  });

  it("should update state when receiving DISPATCH message", (done) => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: "bar " });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({ type: "DISPATCH", state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      expect(timeTravelledState.foo).toBe(expectedStateChange);
      done();
    });
  });

  it("should update Redux DevTools", done => {
    const { store } = createTestStore();

    const spy = jest.spyOn(store, "updateDevToolsState" as any);

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
      done();
    });
  });

  it("should send the newly dispatched actions to the devtools if available", done => {
    const { store } = createTestStore();
    (store as any).devToolsAvailable = true;
    const spy = jest.fn();
    (store as any).devTools = { send: spy };

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      done();
    });
  });
});
