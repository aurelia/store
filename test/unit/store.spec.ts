import { Store } from "./../../src/store";

import "rxjs/add/operator/skip"; 

describe("store", () => {

  function createTestStore() {
    type testState = {
      foo: string
    };

    const initialState = { foo: "bar" };
    const store: Store<testState> = new Store(initialState);

    return { initialState, store };
  }

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

  it("should update Redux DevTools", done => {
    const { initialState, store } = createTestStore();

    const spy = jest.spyOn(store, "updateDevToolsState" as any);

    const modifiedState = { foo: "bert" };
    const fakeAction = (currentState) => {
      return Object.assign({}, currentState, modifiedState);
    };

    store.registerAction("FakeAction", fakeAction);
    store.dispatch(fakeAction);

    store.state.subscribe((state) => {
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
      
      done();
    });
  })
})
