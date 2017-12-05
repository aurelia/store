import "rxjs/add/operator/skip";

import { executeSteps } from "../../src/test-helpers";
import { Store, StateHistory, NextState, jump } from "../../src/store";
import { createTestStore, testState } from "./helpers";

fdescribe("an undoable store", () => {

  it("should accept an initial state", done => {
    const { initialState, store } = createTestStore(true);

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.current).toEqual(initialState);
      done();
    });
  });

  it("should only accept reducers taking at least one parameter", () => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = () => { };

    expect(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }).toThrowError();
  });

  it("should force reducers to return a new state", () => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = (currentState) => { };

    store.registerAction("FakeAction", fakeAction as any);

    expect(() => {
      store.dispatch(fakeAction as any);
    }).toThrowError();
  });

  it("should accept reducers taking multiple parameters", done => {
    const { initialState, store } = createTestStore(true);
    const fakeAction = (currentState, param1, param2) => {
      return Object.assign({}, currentState, { current: { foo: param1 + param2 }});
    };

    store.registerAction("FakeAction", fakeAction as any);
    store.dispatch(fakeAction, "A", "B");

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.current.foo).toEqual("AB");
      done();
    });
  });

  it("should queue the next state after dispatching an action", done => {
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: StateHistory<testState>) => {
      return Object.assign({}, currentState, { current: modifiedState });
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.subscribe((state: StateHistory<testState>) => {
      expect(state.current).toEqual(modifiedState);
      done();
    });
  });

  it("should support promised actions", done => {
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => Promise.resolve({ past: [], current: modifiedState, future: [] });

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.skip(1).subscribe((state: StateHistory<testState>) => {
      expect(state.current).toEqual(modifiedState);
      done();
    });
  });

  it("should provide easy means to test sequences", async () => {
    expect.assertions(3);
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve({ past: [], current: { foo: "A" }, future: []});
    const actionB = (currentState) => Promise.resolve({ past: [], current: { foo: "B" }, future: []});
    const actionC = (currentState) => Promise.resolve({ past: [], current: { foo: "C" }, future: []});
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      (res) => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("B"); store.dispatch(actionC); },
      (res: StateHistory<testState>) => expect(res.current.foo).toBe("C")
    );
  });

  it("should jump back in time", async () => {
    expect.assertions(4);
    const { initialState, store } = createTestStore(true);
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.current], current: { foo: "A" }, future: [] }));
    const actionB = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.current], current: { foo: "B" }, future: [] }));
    const actionC = (currentState) => Promise.resolve(Object.assign({}, currentState, { past: [...currentState.past, currentState.current], current: { foo: "C" }, future: [] }));
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      (res) => store.dispatch(actionA),
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("A"); store.dispatch(actionB); },
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("B"); store.dispatch(actionC); },
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("C"); store.dispatch(jump, -1) },
      (res: StateHistory<testState>) => { expect(res.current.foo).toBe("B"); }
    );
  });
});
