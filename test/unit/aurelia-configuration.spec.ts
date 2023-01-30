import {
  Aurelia,
  Container,
} from "aurelia-framework";

import {
  configure,
  Store
} from "../../src/aurelia-store";

interface State {
  foo: "bar"
};

describe("aurelia setup", () => {
  it("should throw an exception if initialState is not provided via options", () => {
    const cont = new Container();
    const aurelia = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Store)).toBeFalsy();

    expect(() => configure<State>(aurelia, {})).toThrowError();
  });

  it("should provide a configuration method registering the store instance", () => {
    const cont = new Container();
    const aurelia = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Store)).toBeFalsy();

    configure<State>(aurelia, { initialState: { foo: "bar" } });

    expect(aurelia.container.hasResolver(Store)).toBe(true);
    expect(aurelia.container.get(Store)).toBeDefined();
  });

  it("should register the store instance with history support", () => {
    const cont = new Container();
    const aurelia = cont.get(Aurelia);

    expect(aurelia.container.hasResolver(Store)).toBeFalsy();

    configure<State>(aurelia, { initialState: { foo: "bar" }, history: { undoable: true } });

    expect(aurelia.container.get(Store)["options"].history?.undoable).toBe(true);
  });
});
