import "rxjs/add/operator/skip";

import { executeSteps }  from "../../src/test-helpers";
import { Store } from "../../src/store";
import { createTestStore } from "./helpers";

describe("store", () => {

  it("should accept an initial state", done => {
    const { initialState, store } = createTestStore();

    store.state.subscribe((state) => {
      expect(state).toEqual(initialState);
      done();
    });
  });

  it("should accept only reducers taking exactly one parameter", () => {
    const { initialState, store } = createTestStore();
    const fakeAction = () => { };

    expect(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }).toThrowError();
  });

  it("should force reducers to return a new state", () => {
    const { initialState, store } = createTestStore();
    const fakeAction = (currentState) => { };

    store.registerAction("FakeAction", fakeAction as any);

    expect(() => {
      store.dispatch(fakeAction as any);
    }).toThrowError();
  });

  it("should queue the next state after dispatching an action", done => {
    const { initialState, store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should support promised actions", done => {
    const { initialState, store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => Promise.resolve(modifiedState);

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    // since the async action is coming at a later time we need to skip the initial state
    store.state.skip(1).subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should provide easy means to test sequences", async () => {
    expect.assertions(3);
    const { initialState, store } = createTestStore();
    const modifiedState = { foo: "bert" };

    const actionA = (currentState) => Promise.resolve({ foo: "A"});
    const actionB = (currentState) => Promise.resolve({ foo: "B"});
    const actionC = (currentState) => Promise.resolve({ foo: "C"});
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);
    
    await executeSteps(
      store,
      false,
      (res) => store.dispatch(actionA),
      (res) => { expect(res.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.foo).toBe("B"); store.dispatch(actionC); },
      (res) => expect(res.foo).toBe("C")
    );
  });
});
