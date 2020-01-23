import { skip, delay } from "rxjs/operators";
import * as PAL from "aurelia-pal";

import {
  createTestStore,
  testState
} from "./helpers";
import { Store } from "../../src/store";
import { DevToolsOptions } from "../../src/devtools";

class DevToolsMock {
  public subscriptions = [] as Function[];
  public init = jest.fn();
  public subscribe = jest.fn().mockImplementation((cb: (message: any) => void) => this.subscriptions.push(cb));
  public send = jest.fn();

  constructor(public devToolsOptions: DevToolsOptions) { }
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

  it("should setup devtools on construction by default", () => {
    const spy = jest.spyOn(Store.prototype as any, "setupDevTools");
    new Store<testState>({ foo: "bar " });

    expect(spy).toHaveBeenCalled();
    spy.mockReset();
    spy.mockRestore();
  });

  it("should not setup devtools if disabled via options", () => {
    const spy = jest.spyOn(Store.prototype as any, "setupDevTools");
    const theStore = new Store<testState>({ foo: "bar " }, { devToolsOptions: { disable: true } });

    expect(spy).not.toHaveBeenCalled();
    expect((theStore as any).devToolsAvailable).toBe(false);
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

  it("should update state when receiving JUMP_TO_STATE message", (done) => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: "bar " });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({ type: "DISPATCH", payload: { type: "JUMP_TO_STATE" }, state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      expect(timeTravelledState.foo).toBe(expectedStateChange);
      done();
    });
  });

  it("should update state when receiving JUMP_TO_ACTION message", (done) => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: "bar " });
    const devtools = ((store as any).devTools as DevToolsMock);
    const expectedStateChange = "from-redux-devtools";

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({ type: "DISPATCH", payload: { type: "JUMP_TO_ACTION" }, state: JSON.stringify({ foo: expectedStateChange }) });

    store.state.subscribe((timeTravelledState) => {
      expect(timeTravelledState.foo).toBe(expectedStateChange);
      done();
    });
  });

  it("should not update state when receiving COMMIT payload but re-init devtools with current state", () => {
    createDevToolsMock();

    const store = new Store<testState>({ foo: "bar " });
    const nextSpy = jest.spyOn((store as any)._state, "next").mockImplementation(() => console.log("foo"));
    const devtools = ((store as any).devTools as DevToolsMock);

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: undefined,
      payload: { type: "COMMIT", timestamp: 1578982516267 }
    });

    expect(nextSpy).not.toHaveBeenCalledWith((store as any)._state.getValue());
    expect(devtools.init).toHaveBeenCalledTimes(2);
  });

  it("should reset initial state when receiving RESET and re-init devtools", () => {
    createDevToolsMock();

    const initialState = { foo: "bar " };
    const store = new Store<testState>(initialState);
    const resetSpy = jest.spyOn(store, "resetToState");
    const devtools = ((store as any).devTools as DevToolsMock);

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: undefined,
      payload: { type: "RESET", timestamp: 1578982516267 }
    });

    expect(devtools.init).nthCalledWith(2, initialState);
    expect(resetSpy).toHaveBeenCalledWith(initialState);
  });

  it("should rollback to provided state when receiving ROLLBACK and re-init devtools", (done) => {
    createDevToolsMock();

    const rolledBackState = { foo: "pustekuchen" };
    const store = new Store<testState>({ foo: "bar " });
    const resetSpy = jest.spyOn(store, "resetToState");
    const devtools = ((store as any).devTools as DevToolsMock);

    expect(devtools.subscriptions.length).toBe(1);

    devtools.subscriptions[0]({
      type: "DISPATCH",
      state: JSON.stringify(rolledBackState),
      payload: { type: "ROLLBACK", timestamp: 1578982516267 }
    });

    store.state.subscribe((state) => {
      expect(state.foo).toBe(rolledBackState.foo);
      expect(devtools.init).nthCalledWith(2, rolledBackState);
      expect(resetSpy).toHaveBeenCalledWith(rolledBackState);
      done();
    });
  });

  it("should update Redux DevTools", done => {
    createDevToolsMock();

    const { store } = createTestStore();
    const devtools = ((store as any).devTools as DevToolsMock);

    const fakeAction = (currentState: testState, foo: string) => {
      return Object.assign({}, currentState, { foo });
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction, "bert");

    store.state.pipe(
      skip(1),
      delay(1)
    ).subscribe(() => {
      expect(devtools.send).toHaveBeenCalled();
      expect(devtools.send).toHaveBeenCalledWith({
        params: ["bert"], type: "FakeAction"
      }, { foo: "bert" });

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
