import {
  Aurelia,
  Container,
  FrameworkConfiguration
} from "aurelia-framework";

import { configure, Store } from "../../src/aurelia-store";

describe("aurelia setup", () => {
  it("should provide a configuration method registering the store instance", () => {
    const cont = new Container();
    interface State {
      foo: "bar"
    };

    const aurelia: FrameworkConfiguration = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Store)).toBeFalsy();

    configure<State>(aurelia, { foo: "bar" });

    expect(aurelia.container.hasResolver(Store)).toBe(true);
    expect(aurelia.container.get(Store)).toBeDefined();
  });

  it("should register the store instance with history support", () => {
    const cont = new Container();
    interface State {
      foo: "bar"
    };

    const aurelia: FrameworkConfiguration = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Store)).toBeFalsy();

    configure<State>(aurelia, { foo: "bar" }, { history: { undoable: true }});

    expect(aurelia.container.get(Store).options.history.undoable).toBe(true);
  });
});
