import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";

import { Store } from "../../src/store";
import { createStoreWithState } from "./helpers";
import {
  MiddlewarePlacement,
  logMiddleware,
  localStorageMiddleware,
  rehydrateFromLocalStorage
} from "../../src/middleware";
import { executeSteps } from "../../src/test-helpers";
import { nextStateHistory, StateHistory } from "../../src/history";

describe("middlewares", () => {
  interface TestState {
    counter: number;
  }

  const initialState: TestState = {
    counter: 1
  };

  const incrementAction = (currentState: TestState) => {
    const newState = Object.assign({}, currentState);
    newState.counter++;

    return newState;
  };

  it("should allow registering middlewares without parameters", () => {
    const store = createStoreWithState(initialState);
    const noopMiddleware = () => { };

    expect(() => store.registerMiddleware(noopMiddleware, MiddlewarePlacement.Before)).not.toThrowError();
  });

  describe("which are applied before action dispatches", () => {
    it("should synchronously change the provided present state", done => {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter--;

        return newState;
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.subscribe((state: TestState) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should support async middlewares", done => {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = 0;

        return Promise.resolve(newState);
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.subscribe((state: TestState) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should handle throwing middlewares and maintain queue", done => {
      const store = createStoreWithState(initialState);
      const decreaseBefore = (currentState: TestState) => {
        throw new Error("Failed on purpose");
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(2);
        done();
      });
    });
  });

  describe("which are applied after the action dispatches", () => {
    it("should synchronously change the resulting state", done => {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = 1000;

        return newState;
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).take(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should asynchronously change the resulting state", done => {
      const store = createStoreWithState(initialState);

      const fixedValueAfter = (currentState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = 1000;

        return Promise.resolve(newState);
      }
      store.registerMiddleware(fixedValueAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).take(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });
  });

  it("should handle multiple middlewares", done => {
    const store = createStoreWithState(initialState);

    const middlewareFactory = (increaseByX: number) => (currentState: TestState) => {
      const newState = Object.assign({}, currentState);
      newState.counter += increaseByX;

      return newState;
    }

    const increaseByTwoBefore = middlewareFactory(2);
    const increaseByTenBefore = middlewareFactory(10);

    store.registerMiddleware(increaseByTwoBefore, MiddlewarePlacement.Before);
    store.registerMiddleware(increaseByTenBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction);

    store.state.skip(1).take(1).subscribe((state: TestState) => {
      expect(state.counter).toEqual(14);
      done();
    });
  });

  it("should maintain the order of applying middlewares", done => {
    interface State {
      values: string[]
    }
    const initialState: State = {
      values: []
    };
    const store = createStoreWithState(initialState);

    const middlewareFactory = (value: string) => (currentState: State) => {
      const newState = Object.assign({}, currentState);
      newState.values.push(value);

      return newState;
    }

    new Array(26).fill("")
      .forEach((val, idx) => store.registerMiddleware(
        middlewareFactory(String.fromCharCode(65 + idx)),
        MiddlewarePlacement.After)
      );

    const demoAction = (currentState: State) => {
      const newState = Object.assign({}, currentState);
      newState.values.push("Demo");

      return newState;
    };

    store.registerAction("Demo", demoAction);
    store.dispatch(demoAction);

    store.state.skip(1).take(1).subscribe((state: State) => {
      expect(state.values).toEqual(["Demo", ...new Array(26).fill("").map((val, idx) => String.fromCharCode(65 + idx))]);
      done();
    });
  });

  it("should handle middlewares not returning a state", done => {
    const store = createStoreWithState(initialState);

    global.console.log = jest.fn();

    const customLogMiddleware = (currentState) => console.log(currentState);
    store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction);

    store.state.skip(1).subscribe((state: TestState) => {
      expect(global.console.log).toHaveBeenCalled();
      (global.console.log as any).mockReset();
      (global.console.log as any).mockRestore();

      done();
    });
  });

  describe("default implementation", () => {
    it("should provide a default log middleware", done => {
      const store = createStoreWithState(initialState);

      global.console.log = jest.fn();
      store.registerMiddleware(logMiddleware, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(2);
        expect(global.console.log).toHaveBeenCalled();

        (global.console.log as any).mockReset();
        (global.console.log as any).mockRestore();

        done();
      });
    });

    it("should provide a localStorage middleware", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        store: { foo: "bar" },
        getItem(key: string) {
          return this.store[key] || null;
        },
        setItem(key: string, value: string) {
          this.store[key] = value;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(2);
        expect(window.localStorage.getItem("aurelia-store-state")).toBe(JSON.stringify(state));
        done();
      });
    });

    it("should rehydrate state from localStorage", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem(key: string) {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is not available", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = undefined;

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is empty", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem(key: string) {
          return null;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from history state", done => {
      const store = createStoreWithState(initialState, true);

      (window as any).localStorage = {
        getItem(key: string) {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify({ past: [], present: storedState, future: [] });
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state: StateHistory<TestState>) => {
        expect(state.present.counter).toEqual(1000);
        done();
      });
    });

    it("should return the previous state if localStorage state cannot be parsed", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem(key: string) {
          return global;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state: TestState) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });
  });
});
