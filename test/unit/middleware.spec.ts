import { PLATFORM } from "aurelia-pal";
import { skip, take } from "rxjs/operators";

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
import { LogLevel } from "../../src/logging";

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
    const settingsMiddleware = (_: TestState, __: TestState | undefined, settings: typeof fakeSettings) => {
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

  it("should allow checking for registered middlewares", () => {
    const store = createStoreWithState(initialState);
    const testMiddleware = (): false => {
      return false;
    }

    store.registerMiddleware(testMiddleware, MiddlewarePlacement.Before);
    expect(store.isMiddlewareRegistered(testMiddleware)).toBe(true);
  });

  it("should have a reference to the calling action name and its parameters", async () => {
    const store = createStoreWithStateAndOptions<TestState>(initialState, { propagateError: true });
    const expectedActionName = "ActionObservedByMiddleware";

    const actionObservedByMiddleware = (state: TestState, foo: string, bar: string) => {
      return Object.assign({}, state, { counter: foo.length + bar.length });
    }

    const actionAwareMiddleware: Middleware<TestState> = (_, __, ___, action) => {
      expect(action).toBeDefined();
      expect(action!.name).toBe(expectedActionName);
      expect(action!.params).toBeDefined();
      expect(action!.params).toEqual(["A", "B"]);
    }

    store.registerAction(expectedActionName, actionObservedByMiddleware);
    store.registerMiddleware(actionAwareMiddleware, MiddlewarePlacement.After);

    await executeSteps(
      store,
      false,
      () => store.dispatch(actionObservedByMiddleware, "A", "B"),
      (res: TestState) => { expect(res.counter).toBe(2); }
    );
  });

  it("should have a reference all piped actions", async () => {
    const store = createStoreWithStateAndOptions<TestState>(initialState, { propagateError: true });
    const expectedActionName1 = "FirstActionObservedByMiddleware";
    const expectedActionName2 = "SecondActionObservedByMiddleware";

    const firstActionObservedByMiddleware = (state: TestState, _foo: string) => state;
    const secondActionObservedByMiddleware = (state: TestState, _bar: string) => state;

    const actionAwareMiddleware: Middleware<TestState> = (_, __, ___, action) => {
      expect(action).toBeDefined();
      expect(action!.name).toBe(`${expectedActionName1}->${expectedActionName2}`);
      expect(action!.params).toBeDefined();
      expect(action!.params).toEqual(["A", "B"]);
      expect(action!.pipedActions).toEqual([
        { name: expectedActionName1, params: ["A"] },
        { name: expectedActionName2, params: ["B"] }
      ]);
    }

    store.registerAction(expectedActionName1, firstActionObservedByMiddleware);
    store.registerAction(expectedActionName2, secondActionObservedByMiddleware);
    store.registerMiddleware(actionAwareMiddleware, MiddlewarePlacement.After);

    await executeSteps(
      store,
      false,
      () => store
        .pipe(firstActionObservedByMiddleware, "A")
        .pipe(secondActionObservedByMiddleware, "B")
        .dispatch()
    );
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

      const decreaseBefore = (currentState: TestState, originalState?: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState!.counter;

        return newState;
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      const resetBefore = (currentState: TestState, originalState?: TestState) => {
        expect(currentState.counter).toBe(0);
        return originalState;
      }
      store.registerMiddleware(resetBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(2);
        done();
      });
    });

    it("should log all dispatch durations", done => {
      spyOn(PLATFORM.performance, "mark").and.callThrough();
      const store = createStoreWithState(initialState);

      const decreaseBefore = (currentState: TestState, originalState?: TestState) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState!.counter;

        return newState;
      }
      store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

      const resetBefore = (currentState: TestState, originalState?: TestState) => {
        expect(currentState.counter).toBe(0);
        return originalState;
      }
      store.registerMiddleware(resetBefore, MiddlewarePlacement.Before);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe(() => {
        expect(PLATFORM.performance.mark).toHaveBeenNthCalledWith(2, "dispatch-before-decreaseBefore");
        expect(PLATFORM.performance.mark).toHaveBeenNthCalledWith(3, "dispatch-before-resetBefore");
        expect(PLATFORM.performance.mark).toHaveBeenNthCalledWith(4, "dispatch-after-reducer-IncrementAction");
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

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
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

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should get additionally the original state, before prev modifications passed in", done => {
      const store = createStoreWithState(initialState);

      const decreaseAfter = (currentState: TestState, originalState: TestState | undefined) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState!.counter;

        return newState;
      }
      store.registerMiddleware(decreaseAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should log all dispatch durations", done => {
      spyOn(PLATFORM.performance, "mark").and.callThrough();
      const store = createStoreWithState(initialState);

      const decreaseAfter = (currentState: TestState, originalState: TestState | undefined) => {
        const newState = Object.assign({}, currentState);
        newState.counter = originalState!.counter;

        return newState;
      }
      store.registerMiddleware(decreaseAfter, MiddlewarePlacement.After);

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.pipe(
        skip(1),
        take(1)
      ).subscribe(() => {
        expect(PLATFORM.performance.mark).toHaveBeenNthCalledWith(2, "dispatch-after-reducer-IncrementAction");
        expect(PLATFORM.performance.mark).toHaveBeenNthCalledWith(3, "dispatch-after-decreaseAfter");
        done();
      });
    });
  });

  it("should handle throwing middlewares and maintain queue", done => {
    const store = createStoreWithState(initialState);
    const decreaseBefore = () => {
      throw new Error("Failed on purpose");
    }
    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);
    store.dispatch(incrementAction);

    store.state.pipe(
      skip(1)
    ).subscribe((state: TestState) => {
      expect(state.counter).toEqual(2);
      done();
    });
  });

  it("should not swallow errors from middlewares and interrupt queue if option provided", async () => {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    const decreaseBefore = () => {
      throw new Error(errorMsg);
    }
    store.registerMiddleware(decreaseBefore, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e: any) {
      expect(e.message).toBe(errorMsg);
    }
  });

  it("should interrupt queue action if middleware returns sync false", async () => {
    const store = createStoreWithStateAndOptions(initialState, {});
    const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
    const syncFalseMiddleware = (): false => {
      return false;
    }
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    expect(nextSpy).toHaveBeenCalledTimes(0);
  });

  it("should interrupt queue action if after placed middleware returns sync false", async () => {
    const store = createStoreWithStateAndOptions(initialState, {});
    const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
    const syncFalseMiddleware = (): false => {
      return false;
    }
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.After);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    expect(nextSpy).toHaveBeenCalledTimes(0);
  });

  it("should interrupt queue action if middleware returns async false", async () => {
    const store = createStoreWithStateAndOptions(initialState, {});
    const nextSpy = spyOn((store as any)._state, "next").and.callThrough();
    const syncFalseMiddleware = (): Promise<false> => {
      return Promise.resolve<false>(false);
    }
    store.registerMiddleware(syncFalseMiddleware, MiddlewarePlacement.Before);
    store.registerAction("IncrementAction", incrementAction);

    await store.dispatch(incrementAction);

    expect(nextSpy).toHaveBeenCalledTimes(0);
  });

  it("should not continue with next middleware if error propagation is turned on", async () => {
    const errorMsg = "Failed on purpose";
    const store = createStoreWithStateAndOptions(initialState, { propagateError: true });
    let secondMiddlewareIsCalled = false;
    const firstMiddleware = () => {
      throw new Error(errorMsg);
    }
    const secondMiddleware = () => {
      secondMiddlewareIsCalled = true;
    }
    store.registerMiddleware(firstMiddleware, MiddlewarePlacement.Before);
    store.registerMiddleware(secondMiddleware, MiddlewarePlacement.Before);

    store.registerAction("IncrementAction", incrementAction);

    try {
      await store.dispatch(incrementAction);
    } catch (e: any) {
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

    store.state.pipe(
      skip(1),
      take(1)
    ).subscribe((state) => {
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

    store.state.pipe(
      skip(1),
      take(1)
    ).subscribe((state) => {
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

    store.state.pipe(
      skip(1)
    ).subscribe(() => {
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

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(global.console.log).toHaveBeenCalled();

        (global.console.log as any).mockReset();
        (global.console.log as any).mockRestore();

        done();
      });
    });

    it("should accept settinsg to override the log behavior for the log middleware", done => {
      const store = createStoreWithState(initialState);

      global.console.warn = jest.fn();
      store.registerMiddleware(logMiddleware, MiddlewarePlacement.After, { logType: LogLevel.warn });

      store.registerAction("IncrementAction", incrementAction);
      store.dispatch(incrementAction);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(global.console.warn).toHaveBeenCalled();

        (global.console.warn as any).mockReset();
        (global.console.warn as any).mockRestore();

        done();
      });
    });

    it("should provide a localStorage middleware", done => {
      const store = createStoreWithState(initialState);

      PLATFORM.global.localStorage = {
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

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(PLATFORM.global.localStorage.getItem("aurelia-store-state")).toBe(JSON.stringify(state));
        done();
      });
    });

    it("should provide a localStorage middleware supporting a custom key", done => {
      const store = createStoreWithState(initialState);
      const key = "foobar";
      PLATFORM.global.localStorage = {
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

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(2);
        expect(PLATFORM.global.localStorage.getItem(key)).toBe(JSON.stringify(state));
        done();
      });
    });

    it("should rehydrate state from localStorage", done => {
      const store = createStoreWithState(initialState);

      PLATFORM.global.localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should rehydrate state from localStorage using a custom key", done => {
      const store = createStoreWithState(initialState);
      const key = "foobar";

      PLATFORM.global.localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify(storedState);
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key });
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1000);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is not available", done => {
      const store = createStoreWithState(initialState);

      PLATFORM.global.localStorage = undefined;

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from previous state if localStorage is empty", done => {
      const store = createStoreWithState(initialState);

      PLATFORM.global.localStorage = {
        getItem() {
          return null;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });

    it("should rehydrate from history state", done => {
      const store = createStoreWithState(initialHistoryState, true);

      PLATFORM.global.localStorage = {
        getItem() {
          const storedState = Object.assign({}, initialState);
          storedState.counter = 1000;

          return JSON.stringify({ past: [], present: storedState, future: [] });
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.present.counter).toEqual(1000);
        done();
      });
    });

    it("should return the previous state if localStorage state cannot be parsed", done => {
      const store = createStoreWithState(initialState);

      PLATFORM.global.localStorage = {
        getItem() {
          return global;
        }
      };

      store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
      store.registerAction("Rehydrate", rehydrateFromLocalStorage);
      store.dispatch(rehydrateFromLocalStorage);

      store.state.pipe(
        skip(1)
      ).subscribe((state) => {
        expect(state.counter).toEqual(1);
        done();
      });
    });
  });
});
