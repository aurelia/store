import { Container } from "aurelia-framework";
import "rxjs/add/operator/pluck";

import { Store } from "../../src/store";
import { connectTo } from "../../src/decorator";
import { Subscription } from "rxjs/Subscription";

interface DemoState {
  foo: string;
  bar: string;
}

function arrange() {
  const initialState = { foo: "Lorem", bar: "Ipsum" };
  const store: Store<DemoState> = new Store(initialState);
  const container = new Container().makeGlobal();
  container.registerInstance(Store, store);

  return { initialState, store };
}

describe("using decorators", () => {
  it("should be possible to decorate a class and assign the subscribed result to the state property", () => {
    const { store, initialState } = arrange();

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

    @connectTo<DemoState>((store) => store.state.pluck("bar"))
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();
    expect(sut.state).toEqual(undefined);

    (sut as any).bind();

    expect(sut.state).toEqual(initialState.bar);
  });

  it("should use the default state subscription if provided selector returns no observable", () => {
    const { store, initialState } = arrange();

    @connectTo<DemoState>((store) => "foobar" as any)
    class DemoStoreConsumer {
      state: DemoState;
    }

    const sut = new DemoStoreConsumer();

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
  });

  it("should apply original bind method after patch", () => {
    const { store, initialState } = arrange();

    @connectTo()
    class DemoStoreConsumer {
      state: DemoState;
      test = "";

      public bind() {
        this.test = "foobar";
      }
    }

    const sut = new DemoStoreConsumer();

    (sut as any).bind();

    expect(sut.state).toEqual(initialState);
    expect(sut.test).toEqual("foobar");
  });

  describe("the unbind lifecycle-method", () => {
    it("should apply original unbind method after patch", () => {
      const { store, initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
        test = "";

        public unbind() {
          this.test = "foobar";
        }
      }

      const sut = new DemoStoreConsumer();

      (sut as any).bind();

      expect(sut.state).toEqual(initialState);

      (sut as any).unbind();

      expect(sut.test).toEqual("foobar");
    });

    it("should automatically unsubscribe when unbind is called", () => {
      const { store, initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();
      const subscription = ((sut as any)._stateSubscription as Subscription);
      spyOn(subscription, "unsubscribe").and.callThrough();

      expect(sut.state).toEqual(initialState);
      expect(subscription.closed).toBe(false);

      (sut as any).unbind();

      expect(subscription).toBeDefined();
      expect(subscription.closed).toBe(true);
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it("should not unsubscribe if subscription is already closed", () => {
      const { store, initialState } = arrange();

      @connectTo()
      class DemoStoreConsumer {
        state: DemoState;
      }

      const sut = new DemoStoreConsumer();
      expect(sut.state).toEqual(undefined);

      (sut as any).bind();
      const subscription = ((sut as any)._stateSubscription as Subscription);
      subscription.unsubscribe();

      expect(sut.state).toEqual(initialState);
      expect(subscription.closed).toBe(true);

      spyOn(subscription, "unsubscribe");

      (sut as any).unbind();

      expect(subscription).toBeDefined();
      expect(subscription.unsubscribe).not.toHaveBeenCalled();
    });
  });
});
