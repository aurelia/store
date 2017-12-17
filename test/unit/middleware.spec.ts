import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";

import { Store } from "../../src/store";
import { createStoreWithState } from "./helpers";
import { MiddlewarePlacement, logMiddleware } from "../../src/middleware";

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
  })
})
