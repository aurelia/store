import { Container } from "aurelia-framework";
import "rxjs/add/operator/pluck";

import { Store } from '../../src/store';
import { connectTo } from "../../src/decorator";
import { Subscription } from "rxjs/Subscription";

interface DemoState {
  foo: string;
  bar: string;
}

function arrange() {
  const initialState = { foo: "Lorem", bar: "Ipsum" };
  const store: Store<DemoState> = new Store(initialState);

  return { initialState, store };
}

describe("using decorators", () => {
  it("should be possible to decorate a class and assign the subscribed result to the state property", () => {
    const { store, initialState } = arrange();
    const container = new Container().makeGlobal();
    container.registerInstance(Store, store);

    @connectTo()
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
    expect((sut as any)._stateSubscription).toBeDefined();
  });

  it("should be possible to provide a state selector", () => {
    const { store, initialState } = arrange();
    const container = new Container().makeGlobal();
    container.registerInstance(Store, store);

    @connectTo<DemoState>((store) => store.state.pluck("bar"))
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState.bar);
  });

  it("should automatically unsubscribe when unbind is called", () => {
    const { store, initialState } = arrange();
    const container = new Container().makeGlobal();
    container.registerInstance(Store, store);

    @connectTo()
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
    expect(((sut as any)._stateSubscription as Subscription).closed).toBe(false);

    (sut as any).unbind();

    expect((sut as any)._stateSubscription).toBeDefined();
    expect(((sut as any)._stateSubscription as Subscription).closed).toBe(true);
  });
});
