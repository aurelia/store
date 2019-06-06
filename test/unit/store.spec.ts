import { skip } from "rxjs/operators";

import { PerformanceMeasurement } from "../../src/store";
import { LogLevel } from "../../src/aurelia-store";
import {
  createTestStore,
  testState,
  createStoreWithStateAndOptions
} from "./helpers";

describe("store", () => {
  const UNREGISTERED_ACTION_ERROR_PREFIX = "Tried to dispatch an unregistered action ";
  const MINIMUM_ONE_PARAMETER_ERROR_PREFIX = "The reducer is expected to have one or more parameters";
  const NOT_RETURNING_NEW_STATE_ERROR = "The reducer has to return a new state";

  it("should accept an initial state", done => {
    const { initialState, store } = createTestStore();

    store.state.subscribe((state) => {
      expect(state).toEqual(initialState);
      done();
    });
  });

  it("should fail when dispatching unknown actions", async () => {
    const { store } = createTestStore();
    const unregisteredAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    expect((store.dispatch as any)(unregisteredAction)).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "unregisteredAction");
  })

  it("should fail when dispatching non actions", async () => {
    const { store } = createTestStore();

    expect(store.dispatch(undefined as any)).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "undefined");
  })

  it("should only accept reducers taking at least one parameter", () => {
    const { store } = createTestStore();
    const fakeAction = () => { };

    expect(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }).toThrowError(MINIMUM_ONE_PARAMETER_ERROR_PREFIX);
  });

  it("should force reducers to return a new state", async () => {
    const { store } = createTestStore();
    const fakeAction = (_: testState) => { };

    store.registerAction("FakeAction", fakeAction as any);
    expect(store.dispatch(fakeAction as any)).rejects.toThrowError(NOT_RETURNING_NEW_STATE_ERROR);
  });

  it("should also accept false and stop queue", async () => {
    const { store } = createTestStore();
    const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
    const fakeAction = (_: testState): false => false;

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    expect(nextSpy).toHaveBeenCalledTimes(0);
  });

  it("should also accept async false and stop queue", async () => {
    const { store } = createTestStore();
    const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
    const fakeAction = (_: testState): Promise<false> => Promise.resolve<false>(false);

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    expect(nextSpy).toHaveBeenCalledTimes(0);
  });

  it("should unregister previously registered actions", async () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    expect(store.dispatch(fakeAction)).resolves;

    store.unregisterAction(fakeAction);
    expect(store.dispatch(fakeAction)).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "fakeAction");
  });

  it("should not try to unregister previously unregistered actions", async () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    expect(() => store.unregisterAction(fakeAction)).not.toThrow();
  });

  it("should allow checking for already registered functions via Reducer", () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    expect(store.isActionRegistered(fakeAction)).toBe(true);
  });

  it("should allow checking for already registered functions via previously registered name", () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => currentState;

    store.registerAction("FakeAction", fakeAction);
    expect(store.isActionRegistered("FakeAction")).toBe(true);
  });

  it("should accept reducers taking multiple parameters", done => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: string, param2: string) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    store.registerAction("FakeAction", fakeAction as any);
    store.dispatch(fakeAction, "A", "B");

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state.foo).toEqual("AB");
      done();
    });
  });

  it("should queue the next state after dispatching an action", done => {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should the previously registered action name as dispatch argument", done => {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (_: testState) => Promise.resolve(modifiedState);
    const fakeActionRegisteredName = "FakeAction";

    store.registerAction(fakeActionRegisteredName, fakeAction);
    store.dispatch(fakeActionRegisteredName);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should support promised actions", done => {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (_: testState) => Promise.resolve(modifiedState);

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.pipe(
      skip(1)
    ).subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should dispatch actions one after another", (done) => {
    const { store } = createTestStore();

    const actionA = (currentState: testState) => Promise.resolve({ foo: currentState.foo + "A" });
    const actionB = (currentState: testState) => Promise.resolve({ foo: currentState.foo + "B" });

    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.dispatch(actionA);
    store.dispatch(actionB);

    store.state.pipe(
      skip(2)
    ).subscribe((state) => {
      expect(state.foo).toEqual("barAB");
      done();
    });
  });

  it("should maintain queue of execution in concurrency constraints", () => {
    const { store } = createTestStore();
    spyOn((store as any).dispatchQueue, "push");
    const handleQueueSpy = spyOn(store, "handleQueue");

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA);

    expect(handleQueueSpy).not.toHaveBeenCalled();
  });

  it("should log info about dispatched action if turned on via options", () => {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, { logDispatchedActions: true });
    const loggerSpy = spyOn((store as any).logger, "info");

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA);

    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should log info about dispatched action if turned on via options via custom loglevel", () => {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, {
      logDispatchedActions: true,
      logDefinitions: {
        dispatchedActions: LogLevel.debug
      }
    });
    const loggerSpy = spyOn((store as any).logger, LogLevel.debug);

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA);

    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should log info about dispatched action and return to default log level if wrong one provided", () => {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(initialState, {
      logDispatchedActions: true,
      logDefinitions: {
        dispatchedActions: "foo" as any
      }
    });
    const loggerSpy = spyOn((store as any).logger, "info");

    const actionA = (_: testState) => Promise.resolve({ foo: "A" });

    store.registerAction("Action A", actionA);
    store.dispatch(actionA);

    expect(loggerSpy).toHaveBeenCalled();
  });

  it("should log start-end dispatch duration if turned on via options", async () => {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(
      initialState,
      { measurePerformance: PerformanceMeasurement.StartEnd }
    );
    const loggerSpy = spyOn((store as any).logger, "info");

    const actionA = (_: testState) => {
      return new Promise<testState>((resolve) => {
        setTimeout(() => resolve({ foo: "A" }), 1);
      });
    };

    store.registerAction("Action A", actionA);
    await store.dispatch(actionA);

    expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
  });

  it("should log all dispatch durations if turned on via options", async () => {
    const initialState: testState = {
      foo: "bar"
    };

    const store = createStoreWithStateAndOptions<testState>(
      initialState,
      { measurePerformance: PerformanceMeasurement.All }
    );
    const loggerSpy = spyOn((store as any).logger, "info");

    const actionA = (_: testState) => {
      return new Promise<testState>((resolve) => {
        setTimeout(() => resolve({ foo: "A" }), 1);
      });
    };

    store.registerAction("Action A", actionA);
    await store.dispatch(actionA);

    expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
  });

  it("should reset the state without going through the internal dispatch queue", async (done) => {
    const { initialState, store } = createTestStore();
    const internalDispatchSpy = jest.spyOn((store as any), "internalDispatch");
    const demoAction = (currentState: testState) => {
      return Object.assign({}, currentState, { foo: "demo" })
    };

    store.registerAction("demoAction", demoAction);

    await store.dispatch(demoAction);
    internalDispatchSpy.mockReset();
    store.resetToState(initialState);

    store.state.subscribe((state) => {
      expect(internalDispatchSpy).not.toHaveBeenCalled();
      expect(state.foo).toBe(initialState.foo);

      done();
    });
  });

  describe("piped dispatch", () => {
    it("should fail when dispatching unknown actions", async () => {
      const { store } = createTestStore();
      const unregisteredAction = (currentState: testState, param1: string) => {
        return Object.assign({}, currentState, { foo: param1 });
      };

      expect(() => store.pipe(unregisteredAction, "foo")).toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "unregisteredAction");
    });

    it("should fail when at least one action is unknown", async () => {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState) => Object.assign({}, currentState);
      store.registerAction("FakeAction", fakeAction);
      const unregisteredAction = (currentState: testState, param1: string) => Object.assign({}, currentState, { foo: param1 });

      const pipedDispatch = store.pipe(fakeAction);

      expect(() => pipedDispatch.pipe(unregisteredAction, "foo")).toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "fakeAction");
    });

    it("should fail when dispatching non actions", async () => {
      const { store } = createTestStore();

      expect(() => store.pipe(undefined as any)).toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "undefined");
    });

    it("should fail when at least one action is no action", async () => {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState) => Object.assign({}, currentState);
      store.registerAction("FakeAction", fakeAction);

      const pipedDispatch = store.pipe(fakeAction);

      expect(() => pipedDispatch.pipe(undefined as any)).toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "fakeAction");
    });

    it("should force reducer to return a new state", async () => {
      const { store } = createTestStore();
      const fakeAction = (_: testState) => { };

      store.registerAction("FakeAction", fakeAction as any);
      expect(store.pipe(fakeAction as any).dispatch()).rejects.toThrowError(NOT_RETURNING_NEW_STATE_ERROR);
    });

    it("should force all reducers to return a new state", async () => {
      const { store } = createTestStore();
      const fakeActionOk = (currentState: testState) => Object.assign({}, currentState);
      const fakeActionNok = (_: testState) => { };
      store.registerAction("FakeActionOk", fakeActionOk);
      store.registerAction("FakeActionNok", fakeActionNok as any);

      expect(store.pipe(fakeActionNok as any).pipe(fakeActionOk).dispatch()).rejects.toThrowError(NOT_RETURNING_NEW_STATE_ERROR);
    });

    it("should also accept false and stop queue", async () => {
      const { store } = createTestStore();
      const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
      const fakeAction = (_: testState): false => false;

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch();

      expect(nextSpy).toHaveBeenCalledTimes(0);
    });

    it("should also accept async false and stop queue", async () => {
      const { store } = createTestStore();
      const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
      const fakeAction = (_: testState): Promise<false> => Promise.resolve<false>(false);

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch();

      expect(nextSpy).toHaveBeenCalledTimes(0);
    });

    it("should accept reducers taking multiple parameters", done => {
      const { store } = createTestStore();
      const fakeAction = (currentState: testState, param1: string, param2: string) => {
        return Object.assign({}, currentState, { foo: param1 + param2 })
      };

      store.registerAction("FakeAction", fakeAction as any);
      store.pipe(fakeAction, "A", "B").dispatch();

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.foo).toEqual("AB");
        done();
      });
    });

    it("should queue the next state after dispatching an action", done => {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = (currentState: testState) => {
        return Object.assign({}, currentState, modifiedState);
      };

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch();

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state).toEqual(modifiedState);
        done();
      });
    });

    it("should accept the previously registered action name as pipe argument", done => {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = (_: testState) => Promise.resolve(modifiedState);
      const fakeActionRegisteredName = "FakeAction";

      store.registerAction(fakeActionRegisteredName, fakeAction);
      store.pipe(fakeActionRegisteredName).dispatch();

      // since the async action is coming at a later time we need to skip the initial state
      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state).toEqual(modifiedState);
        done();
      });
    });

    it("should not accept an unregistered action name as pipe argument", () => {
      const { store } = createTestStore();
      const unregisteredActionId = "UnregisteredAction";

      expect(() => store.pipe(unregisteredActionId)).toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + unregisteredActionId);
    });

    it("should support promised actions", done => {
      const { store } = createTestStore();
      const modifiedState = { foo: "bert" };
      const fakeAction = (_: testState) => Promise.resolve(modifiedState);

      store.registerAction("FakeAction", fakeAction);
      store.pipe(fakeAction).dispatch();

      // since the async action is coming at a later time we need to skip the initial state
      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state).toEqual(modifiedState);
        done();
      });
    });

    it("should dispatch actions one after another", (done) => {
      const { store } = createTestStore();

      const actionA = (currentState: testState) => Promise.resolve({ foo: currentState.foo + "A" });
      const actionB = (currentState: testState) => Promise.resolve({ foo: currentState.foo + "B" });

      store.registerAction("Action A", actionA);
      store.registerAction("Action B", actionB);
      store.pipe(actionA).dispatch();
      store.pipe(actionB).dispatch();

      store.state.pipe(
        skip(2)
      ).subscribe((state) => {
        expect(state.foo).toEqual("barAB");
        done();
      });
    });

    it("should maintain queue of execution in concurrency constraints", () => {
      const { store } = createTestStore();
      spyOn((store as any).dispatchQueue, "push");
      const handleQueueSpy = spyOn(store, "handleQueue");

      const actionA = (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch();

      expect(handleQueueSpy).not.toHaveBeenCalled();
    });

    it("should log info about dispatched action if turned on via options", () => {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, { logDispatchedActions: true });
      const loggerSpy = spyOn((store as any).logger, "info");

      const actionA = (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch();

      expect(loggerSpy).toHaveBeenCalled();
    });

    it("should log info about dispatched action if turned on via options via custom loglevel", () => {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, {
        logDispatchedActions: true,
        logDefinitions: {
          dispatchedActions: LogLevel.debug
        }
      });
      const loggerSpy = spyOn((store as any).logger, LogLevel.debug);

      const actionA = (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch();

      expect(loggerSpy).toHaveBeenCalled();
    });

    it("should log info about dispatched action and return to default log level if wrong one provided", () => {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(initialState, {
        logDispatchedActions: true,
        logDefinitions: {
          dispatchedActions: "foo" as any
        }
      });
      const loggerSpy = spyOn((store as any).logger, "info");

      const actionA = (_: testState) => Promise.resolve({ foo: "A" });

      store.registerAction("Action A", actionA);
      store.pipe(actionA).dispatch();

      expect(loggerSpy).toHaveBeenCalled();
    });

    it("should log start-end dispatch duration if turned on via options", async () => {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(
        initialState,
        { measurePerformance: PerformanceMeasurement.StartEnd }
      );
      const loggerSpy = spyOn((store as any).logger, "info");

      const actionA = (_: testState) => {
        return new Promise<testState>((resolve) => {
          setTimeout(() => resolve({ foo: "A" }), 1);
        });
      };

      store.registerAction("Action A", actionA);
      await store.pipe(actionA).dispatch();

      expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
    });

    it("should log all dispatch durations if turned on via options", async () => {
      const initialState: testState = {
        foo: "bar"
      };

      const store = createStoreWithStateAndOptions<testState>(
        initialState,
        { measurePerformance: PerformanceMeasurement.All }
      );
      const loggerSpy = spyOn((store as any).logger, "info");

      const actionA = (_: testState) => {
        return new Promise<testState>((resolve) => {
          setTimeout(() => resolve({ foo: "A" }), 1);
        });
      };

      store.registerAction("Action A", actionA);
      await store.pipe(actionA).dispatch();

      expect(loggerSpy).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
    });
  });

  describe("internalDispatch", () => {
    it("should throw an error when called with unregistered actions", () => {
      const { store } = createTestStore();
      const unregisteredAction = (currentState: testState, param1: string) => {
        return Object.assign({}, currentState, { foo: param1 });
      };

      expect((store as any).internalDispatch([{ reducer: unregisteredAction, params: ["foo"] }])).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "unregisteredAction");
    });

    it("should throw an error when one action of multiple actions is unregistered", () => {
      const { store } = createTestStore();
      const registeredAction = (currentState: testState) => currentState;
      const unregisteredAction = (currentState: testState) => currentState;
      store.registerAction("RegisteredAction", registeredAction);


      expect((store as any).internalDispatch([
        { reducer: registeredAction, params: [] },
        { reducer: unregisteredAction, params: [] }
      ])).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "unregisteredAction");
    });

    it("should throw an error about the first of many unregistered actions", () => {
      const { store } = createTestStore();
      const registeredAction = (currentState: testState) => currentState;
      const firstUnregisteredAction = (currentState: testState) => currentState;
      const secondUnregisteredAction = (currentState: testState) => currentState;
      store.registerAction("RegisteredAction", registeredAction);


      expect((store as any).internalDispatch([
        { reducer: registeredAction, params: [] },
        { reducer: firstUnregisteredAction, params: [] },
        { reducer: secondUnregisteredAction, params: [] }
      ])).rejects.toThrowError(UNREGISTERED_ACTION_ERROR_PREFIX + "firstUnregisteredAction");
    });
  });
});
