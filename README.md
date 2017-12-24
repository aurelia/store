# aurelia-store

[![CircleCI](https://circleci.com/gh/zewa666/aurelia-store/tree/master.svg?style=svg)](https://circleci.com/gh/zewa666/aurelia-store/tree/master)

Aurelia single state store based on RxJS

THIS IS WORK IN PROGRESS, DO NOT USE YET FOR PRODUCTION

## Install
Install the npm dependency via

```bash
npm install aurelia-store
```

## Aurelia CLI Support
If your Aurelia CLI build is based on RequireJS or SystemJS you can setup the plugin using the following dependency declaration:

```json
...
"dependencies": [
  {
    "name": "aurelia-store",
    "path": "../node_modules/aurelia-store/dist/amd",
    "main": "aurelia-store"
  },
  {
    "name": "rxjs",
    "path": "../node_modules/rxjs",
    "main": false
  }
]
```

## Configuration
In your `main.ts` you'll have to register the Store using a custom entity as your State type:

```typescript
import {Aurelia} from 'aurelia-framework'
import {initialState} from './state';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  ...

  aurelia.use.plugin("aurelia-store", initialState);  // <----- REGISTER THE PLUGIN

  aurelia.start().then(() => aurelia.setRoot());
}
```

The state itself can be a simple object like this:

```typescript
// state.ts
export interface State {
  frameworks: string[];
}

export const initialState: State = {
  frameworks: ["Aurelia", "React", "Angular"]
};
```


## Usage
Once the plugin is installed and configured you can use the Store by injecting it via constructor injection.

You register actions (reducers) with methods, which get the current state and have to return the modified next state.

An example VM and View can be seen below:

```typescript
import { autoinject } from 'aurelia-dependency-injection';
import { State } from './state';
import { Store } from "aurelia-store";

// An action is a simple function which gets the current state and should return a modified clone of it.
// You should not modify and return the previous state, as the states act as snapshots of your app over time
// which enables cool features like time-travelling, Redux DevTools integration and so on ...
const demoAction = (state: State) => {
  const newState = Object.assign({}, state);
  newState.frameworks.push("PustekuchenJS");

  return newState;
}

@autoinject()
export class App {

  public state: State;

  constructor(private store: Store<State>) {
    this.store.registerAction("DemoAction", demoAction);
  }

  attached() {
    // this is the single point of data subscription, the state inside the component will be automatically updated
    // no need to take care of manually handling that. This will also update all subcomponents.
    // Since the state is an observable you can use all kinds of RxJS witchcraft to skip,filter,map streamed states.
    this.store.state.subscribe(
      (state: State) => this.state = state
    );
  }

  addAnotherFramework() {
    // you create a new state by dispatching your action using the stores method
    this.store.dispatch(demoAction);
  }
}
```

```html
<template>
  <h1>Frameworks</h1>

  <ul>
    <li repeat.for="framework of state.frameworks">${framework}</li>
  </ul>

  <button click.delegate="addAnotherFramework()">Add one more</button>
</template>

```

## Passing parameters to actions
You can provide parameters to your actions by adding them after the initial state parameter. When dispatching provide your values which will be spread to the actual reducer.

```typescript
// additional parameter
const greetingAction = (state: State, greetingTarget: string) => {
  const newState = Object.assign({}, state);
  newState.target = greetingTarget;

  return newState;
}

...

// dispatching with the value for greetingTarget
this.store.dispatch(greetingAction, "zewa666");
```

### Dispatchifying actions
Perhaps you don't want or can't obtain a reference to the store but still would like to dispatch your actions.
In order to do so you can leverage the higher order function `dispatchify` like this:

```typescript
import { dispatchify } from "aurelia-store";
import { yourAction } from "./where/ever";

dispatchify(yourAction)("PARAM1", "MYPARAM2", "AND_SO_ON");
```

## Undo / Redo support
If you need to keep track of the history of states you can pass a third parameter to the Store initialization with the value of `true` to setup the store to work on a `StateHistory` vs `State` model.

```typescript
export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  ...

  const initialState: State = {
    frameworks: ["Aurelia", "React", "Angular"]
  };

  aurelia.use.plugin("aurelia-store", initialState, true);  // <----- REGISTER THE PLUGIN WITH HISTORY SUPPORT

  aurelia.start().then(() => aurelia.setRoot());
}
```

Now when you subscribe to new state changes instead of a simple State you'll get a StateHistory<State> object returned:

```typescript
attached() {
  this.store.state.subscribe(
    (state: StateHistory<State>) => this.state = state
  );
}
```

A state history is an interface defining all past and future states as arrays of these plus a currently present one.
```typescript
// aurelia-store -> history.ts
export interface StateHistory<T> {
  past: T[];
  present: T;
  future: T[];
}
```

Now keep in mind that every action will receive a `StateHistory<T>` as input and should return a new `StateHistory<T>`.
You can use the `nextStateHistory` helper function to easily push your new state and create a proper StateHistory representation, which will simply move the currently present state to the past, place your provided one as present and remove the future states.

```typescript
import { nextStateHistory } from "aurelia-store";

const greetingAction = (currentState: StateHistory<State>, greetingTarget: string) => {
  return nextStateHistory(currentState, { target: greetingTarget });
}
```

Which is the same as returing a handcrafted object like the following:

```typescript
const greetingAction = (currentState: StateHistory<State>, greetingTarget: string) => {
  return Object.assign(
    {},
    currentState,
    { 
      past: [...currentState.past, currentState.present],
      present: { target: greetingTarget },
      future: [] 
    }
  );
}
```

### Navigating through history
In order to do state time-travelling you can import the pre-registered action `jump` and pass it either a positive number for traveling into the future or a negative for travelling to past states.

```typescript
import { jump } from "aurelia-store";

...
// Go back one step in time
store.dispatch(jump, -1);

// Move forward one step to future
store.dispatch(jump, 1);

```

## Async actions
You may also register actions which resolve the newly created state with a promise. Same applies for history enhanced Stores. Just make sure the all past/present/future states by themselves are synchronous values.

## Middleware
A middleware is similar to an action, with the difference that it may return void as well. Middlewares can be executed before the dispatched action, thus potentially manipulating the current state which will be passed to the action, or afterwards, thus modifying the returned value from the action. Either way the middleware reducer can be sync as well as async.

You register a middleware by it as the first parameter to `store.registerMiddleware` and the placement `before` or `after` as second. 
```typescript
const customLogMiddleware = (currentState) => console.log(currentState);
// In TypeScript you can use the exported MiddlewarePlacement string enum
store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.After);

// in JavaScript just provide the string "before" or "after"
store.registerMiddleware(customLogMiddleware, "after");
```

In order to remove a registered middleware, simply call `store.unregisterMiddleware`

```typescript
...
store.unregisterMiddleware(customLogMiddleware);
```

### LocalStorage Middleware
Out of the box aurelia-store provides an `localStorageMiddleware` which stores your most recent emitted state in the [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). In order to make use of it all you need to do is to register it as usual:

```typescript
import { localStorageMiddleware } from "aurelia-store";

...

store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After);
```

Now in order to rehydrate the stored state all you need to do is to dispatch the provided `rehydrateFromLocalStorage` action:

```typescript
import { rehydrateFromLocalStorage } from "aurelia-store";

...

store.registerAction("Rehydrate", rehydrateFromLocalStorage);
store.dispatch(rehydrateFromLocalStorage);
```

## Acknowledgement
Thanks goes to Dwayne Charrington for his Aurelia-TypeScript starter package https://github.com/Vheissu/aurelia-typescript-plugin

## Further info
If you want to learn more about state containers in Aurelia take a look at this article from [Pragmatic Coder](http://pragmatic-coder.net/using-a-state-container-with-aurelia/)
