import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";

import {
  MiddlewarePlacement,
  logMiddleware,
  localStorageMiddleware,
  rehydrateFromLocalStorage,
  Middleware
} from "../../src/middleware";

import {
  createStoreWithState,
  createStoreWithStateAndOptions
} from "./helpers";
import { executeSteps } from "../../src/test-helpers";
import { StateHistory } from "../../src/history";

describe("middlewares", () => {
  interface TestState {
    counter: number;
  }

  const initialState: TestState = {
    counter: 1
  };

  const initialHistoryState: StateHistory<TestState> = {
    past: [],
    present: { counter: 1 },
    future: [],
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

  it("should allow registering middlewares with additional settings", async () => {
    const store = createStoreWithState(initialState);
    const fakeSettings = { foo: "bar" };
    const settingsMiddleware: Middleware<TestState> = (currentState, originalState, settings) => {
      try {
        expect(settings.foo).toBeDefined();
        expect(settings.foo).toEqual(fakeSettings.foo);
      } catch {
        fail("No settings were passed");
      }
    };

    expect(() => store.registerMiddleware(settingsMiddleware, MiddlewarePlacement.Before, fakeSettings)).not.toThrowError();

    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);
  });

  it("should allow unregistering middlewares", async () => {
    const store = createStoreWithState(initialState);
    const decreaseBefore = (currentState: TestState) => {
      const newState = Object.assign({}, currentState);
      newState.counter += 1000;

      return newState;
    }

    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await executeSteps(
      store,
      false,
      () => store.dispatch(incrementAction),
      (res: TestState) => {
        expect(res.counter).toEqual(1002);
        store.unregisterMiddleware(decreaseBefore);
        store.dispatch(incrementAction);
      },
      (res: TestState) => expect(res.counter).toEqual(1003)
    );
  });

  it("should not try to delete previously unregistered middlewares", async () => {
    const store = createStoreWithState(initialState);

    spyOn((store as any).middlewares, "delete");

    const decreaseBefore = (currentState: TestState) => {
      const newState = Object.assign({}, currentState);
      newState.counter += 1000;

      return newState;
    }

    store.registerAction("IncrementAction", incrementAction);
    store.unregisterMiddleware(decreaseBefore);

    expect((store as any).middlewares.delete).not.toHaveBeenCalled();
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

      store.state.subscribe((state) => {
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

      store.state.subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should get additionally the original state, before prev modifications passed in", done => {
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState, originalState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState.counter;

        return newState;
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      const resetBefore = (currentState: TestState, originalState: TestState) => {
        expect(currentState.counter).toBe(0);
        return originalState;
      }
      store.registerMiddleware(resetBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).take(1).subscribe((state) => {
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

      store.state.skip(1).take(1).subscribe((state) => {
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

      store.state.skip(1).take(1).subscribe((state) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should get additionally the original state, before prev modifications passed in", done => {
      const store = createStoreWithState(initialState);

      const decreaseAfter = (currentState: TestState, originalState: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState.counter;

        return newState;
      }
      store.registerMiddleware(decreaseAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).take(1).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
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

  it("should not swallow errors from middlewares and interrupt queue if option provided", async () => {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    const decreaseBefore = (currentState: TestState) => {
      throw new Error(errorMsg);
    }
    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e) {
      expect(e.message).toBe(errorMsg);
    }
  });

  it("should not continue with next middleware if error propagation is turned on", async () => {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    let secondMiddlewareIsCalled = false;
    const firstMiddleware = (currentState: TestState) => {
      throw new Error(errorMsg);
    }
    const secondMiddleware = (currentState: TestState) => {
      secondMiddlewareIsCalled = true;
    }
    store.registerMiddleware(firstMiddleware, MiddlewarePlacement.Before);
    store.registerMiddleware(secondMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e) {
      expect(e.message).toBe(errorMsg);
    }

    expect(secondMiddlewareIsCalled).toBe(false);
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

    store.state.skip(1).take(1).subscribe((state) => {
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
      .forEach((_, idx) => store.registerMiddleware(
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

    store.state.skip(1).take(1).subscribe((state) => {
      expect(state.values).toEqual(["Demo", ...new Array(26).fill("").map((_, idx) => String.fromCharCode(65 + idx))]);
      done();
    });
  });

  it("should handle middlewares not returning a state", done => {
    const store = createStoreWithState(initialState);

    global.console.log = jest.fn();

    const customLogMiddleware = (currentState: TestState) => console.log(currentState);
    store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction);

    store.state.skip(1).subscribe(() => {
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

      store.state.skip(1).subscribe((state) => {
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

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(window.localStorage.getItem("aurelia-store-state")).toBe(JSON.stringify(state));
        done();
      });
    });

    it("should provide a localStorage middleware supporting a custom key", done => {
      const store = createStoreWithState(initialState);
      const key = "foobar";
      (window as any).localStorage = {
        store: { foo: "bar" },
        getItem(key: string) {
          return this.store[key] || null;
        },
        setItem(key: string, value: string) {
          this.store[key] = value;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key });

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(window.localStorage.getItem(key)).toBe(JSON.stringify(state));
        done();
      });
    });

    it("should rehydrate state from localStorage", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should rehydrate state from localStorage using a custom key", done => {
      const store = createStoreWithState(initialState);
      const key = "foobar";

      (window as any).localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key });
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state) => {
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

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is empty", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem() {
          return null;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from history state", done => {
      const store = createStoreWithState(initialHistoryState, true);

      (window as any).localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify({ past: [], present: storedState, future: [] });
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state) => {
        expect(state.present.counter).toEqual(1000);
        done();
      });
    });

    it("should return the previous state if localStorage state cannot be parsed", done => {
      const store = createStoreWithState(initialState);

      (window as any).localStorage = {
        getItem() {
          return global;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.skip(1).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });
  });
});
