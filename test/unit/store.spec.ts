import { Container } from "aurelia-framework";
import "rxjs/add/operator/skip";

import {
  dispatchify,
  Store
} from "../../src/store";
import {
  createTestStore,
  testState
} from "./helpers";

import { executeSteps } from "../../src/test-helpers";

describe("store", () => {
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

    expect(store.dispatch(unregisteredAction)).rejects.toThrowError();
  })

  it("should only accept reducers taking at least one parameter", () => {
    const { store } = createTestStore();
    const fakeAction = () => { };

    expect(() => {
      store.registerAction("FakeAction", fakeAction as any);
    }).toThrowError();
  });

  it("should force reducers to return a new state", async () => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState) => { };

    store.registerAction("FakeAction", fakeAction as any);
    expect(store.dispatch(fakeAction as any)).rejects.toBeDefined();
  });

  it("should help create dispatchifyable functions", done => {
    const cont = new Container().makeGlobal();
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: number, param2: number) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    store.registerAction("FakeAction", fakeAction as any);
    cont.registerInstance(Store, store);

    dispatchify(fakeAction)("A", "B");

    store.state.skip(1).subscribe((state) => {
      expect(state.foo).toEqual("AB");
      done();
    });
  });

  it("should accept reducers taking multiple parameters", done => {
    const { store } = createTestStore();
    const fakeAction = (currentState: testState, param1: string, param2: string) => {
      return Object.assign({}, currentState, { foo: param1 + param2 })
    };

    store.registerAction("FakeAction", fakeAction as any);
    store.dispatch(fakeAction, "A", "B");

    store.state.skip(1).subscribe((state) => {
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

    store.state.skip(1).subscribe((state) => {
      expect(state).toEqual(modifiedState);
      done();
    });
  });

  it("should support promised actions", done => {
    const { store } = createTestStore();
    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState: testState) => Promise.resolve(modifiedState);

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
    const { store } = createTestStore();

    const actionA = (currentState: testState) => Promise.resolve({ foo: "A" });
    const actionB = (currentState: testState) => Promise.resolve({ foo: "B" });
    const actionC = (currentState: testState) => Promise.resolve({ foo: "C" });
    store.registerAction("Action A", actionA);
    store.registerAction("Action B", actionB);
    store.registerAction("Action C", actionC);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionA),
      (res) => { expect(res.foo).toBe("A"); store.dispatch(actionB); },
      (res) => { expect(res.foo).toBe("B"); store.dispatch(actionC); },
      (res) => expect(res.foo).toBe("C")
    );
  });
});
