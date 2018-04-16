---
name: Managing App State
description: Using the Aurelia Store plugin for predictable state management.
author: Vildan Softic (http://github.com/zewa666)
---
## Introduction

This article covers the Store plugin for Aurelia. It is built on top of two core features of [RxJS](http://reactivex.io/rxjs/), namely Observables and the BehaviorSubject. You're not forced to delve into the reactive universe, in fact, you'll barely notice it at the begin but certainly can benefit a lot when using it wisely.

Various examples, demonstrating individual pieces of the plugin, can be found in the [samples repository](https://github.com/zewa666/aurelia-store-examples).

### Reasons for state management

Currently, a lot of modern development approaches leverage a single store, which acts as a central basis of your app. The idea is that it holds all data, that makes up your application. The content of your store is your application's state. If you will, the app state is a snapshot of data at a specific moment in time. You modify that by using Actions, which are the only way to manipulate the global state, and create the next app state.

Contrast this to classic service-oriented approaches, where data is split amongst several service entities. What turns out to be a simpler approach, in the beginning, especially combined with a powerful IoC Container, can become a problem once the size of the app grows. Not only do you start to get increased complexity and inter-dependency of your services, but keeping track of who modified what and how to notify every component about a change can become tricky.

Leveraging a single store approach, there is only one source of truth for your data and all modifications happen in a predictable way, potentially leading to a *more* side-effect-free overall application.

### Why is RxJS used for this plugin?

As mentioned in the intro this plugin uses RxJS as a foundation. The main idea is having a [BehaviorSubject](http://reactivex.io/rxjs/manual/overview.html#behaviorsubject) `store._state` which will store the current state, at the begin the initial state, and emit new states as they come. Since having access to the BehaviorSubject would allow consumers to directly emit the `next` value, instead of a front-facing `state` property, being an Observable which connects to the BehaviorSubject, is exposed. This way consumers only have access to streamed values but cannot directly manipulate the streaming queue.

But besides these core features, RxJS itself can be described as [*Lodash/Underscore for events*](http://reactivex.io/rxjs/manual/overview.html#introduction). As such all of the operators and objects can be used to manipulate the state in whatever way necessary. As an example [pluck](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-pluck) can be used to pierce into a sub-section of the state, whereas methods like [skip]()http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-skip and [take](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-take) are great ways to unit test the stream of states over time.

The main reason for using RxJS though is that observables are delivered over time. This promotes a reactive approach to how you'd design your application. Instead of pursuing an imperative approach like **a click on button A** should **trigger a re-rendering on component B**, we follow an [Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern) where **component B observes a global state** and **acts on changes**, which are **triggered through actions by button A**.

Broken down on the concepts of Aurelia, as depicted in the following chart, this means that a ViewModel subscribes to the single store and sets up a state subscription. The view directly binds to properties of the state. Actions can be dispatched and trigger the next state emit. Now the initial subscription receives the next state and changes the bound variable, Aurelia automatically figures out what changed and triggers a re-render. The next dispatch will then trigger the next cycle and so on. This way the system behaves in a cyclic, reactive way and sees state changes as requests for a re-rendering.

![Chart workflow](./images/chart_store_workflow.png)

A fundamental benefit of that approach is, that you as a developer do not need to think of signaling individual components about changes, but rather they will all listen and react to changes by themselves if the respective part of the state gets modified. Think of it as an event dispatch, where multiple recipients can listen for and perform changes but with the benefit of a formalized global state. As such, all you need to focus on is the state and the rest will be handled automatically.

Another benefit is the async nature of the subscription. No matter whether the action is a synchronous operation, like changing the title of your page, an Ajax request to fetch the latest products or a long-running web-socket for your next chat application. Whenever you dispatch the next action, listeners will react to these changes.

## Getting Started

Install the npm dependency via

```Shell
npm install aurelia-store
```

or using [Yarn](https://yarnpkg.com)
```Shell
yarn add aurelia-store
```

If your app is based on the Aurelia CLI and the build is based on RequireJS or SystemJS, you can setup the plugin using the following automatic dependency import:

```Shell
au import aurelia-store
```

alternatively, you can manually add these dependencies to your vendor bundle:

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

## Granular (patched) RxJS imports
Looking at the above dependency configuration for Aurelia CLI you'll note the use of `"main": false`, which tells the loader not to use any default file and not start importing things right away. The reason for this is that importing the whole RxJS library would net result in additional ~250kb for your app, where you'd most of the time need only a minimum subset. Patched imports enable to bundle only things directly referenced.

What you need to make sure of when requesting features from RxJS though is that you do not import the full library itself anywhere. This applies to other bundlers such as Webpack as well. That can happen through one of the following statements:

<code-listing heading="Imports triggering a full RxJS bundle">
  <source-code lang="TypeScript">
    
    import * as rx from 'rxjs';  
    import { Observable, ... } from 'rxjs';  
    import 'rxjs';  
    import 'rxjs/Rx'; 
  </source-code>
</code-listing>

So try to avoid these and instead only import operators and observable features as needed like in the following way:

<code-listing heading="Imports triggering a full RxJS bundle">
  <source-code lang="TypeScript">
    
    // Imports the Observable constructor
    import { Observable } from 'rxjs/Observable'; 

    // Imports only the map operator 
    import "rxjs/add/operator/map"; 

    // Imports and patches the static method of
    import "rxjs/add/observable/of"; 
  </source-code>
</code-listing>

> Additional information and tips & tricks about size-sensitive bundling with Aurelia CLI can be found [here](http://pragmatic-coder.net/aurelia-cli-and-rxjs-size-sensitive-bundles/)

## What is the State?

A typical application consists of multiple components, which render various data. Besides actual data though, your components also contain the various statuses, like an active state for a toggle button, but also high-level states like the selected theme or current page.
The contained component state is a good thing and should stay with the component, as long as only that single instance cares about it. The moment you reference the internal state from another component though, you're going to need a different approach like service classes. Another related topic is the inter-component communication where both services but also pub-sub mechanisms like the EventAggregator may be used.

In contrast to that, the Store plugin operates on a single overall application state. Think of it as a large object containing all the sub-states reflecting your applications condition at a specific moment in time. This state object needs only to contain serializable properties. With that you gain the benefit of having snapshots of your app, which allow all kinds of cool features like time-traveling, save/reload and so on.

How much you put into your state is up to you, but a good rule of thumb is that as soon as two different areas of your application consume the same data or affect component states you should store them.

Your app will typically start with a beginning state, called initial state, which later on is manipulated throughout the app's lifecycle. As mentioned it can be pretty much anything like shown in below example. Whether you prefer TypeScript or pure JavaScript is up to you, but having a typed state, allows for easier refactoring and better autocompletion support.

<code-listing heading="Defining the State entity and initialState">
  <source-code lang="TypeScript">
    
    // state.ts
    export interface State {
      frameworks: string[];
    }

    export const initialState: State = {
      frameworks: ["Aurelia", "React", "Angular"]
    };
  </source-code>
</code-listing>
<code-listing heading="Defining the initialState">
  <source-code lang="JavaScript">
    
    // state.js
    export const initialState = {
      frameworks: ["Aurelia", "React", "Angular"]
    };
  </source-code>
</code-listing>

## Configuring your app

In order to tell Aurelia how to use the plugin, we need to register it. This is done in your apps `main` file, specifically the `configure` method. We'll have to register the Store using our previously defined State entity:

<code-listing heading="Registering the plugin">
  <source-code lang="TypeScript">
    
    // main.ts
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia: Aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", { initialState });  // <----- REGISTER THE PLUGIN

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>
<code-listing heading="Registering the plugin">
  <source-code lang="JavaScript">
    
    // main.js
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", { initialState });  // <----- REGISTER THE PLUGIN

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>

With this done we're ready to consume our app state and dive into the world of state management.

## Subscribing to the stream of states

As explained in the beginning, the Aurelia Store plugin provides a public observable called `state` which will stream the apps states over time. So in order to consume it, we first need to inject the store via dependency injection into the constructor. Next, inside the `bind` lifecycle method we are subscribing to the store's `state` property. Inside the *next-handler* we'll have the actually streamed state and may assign it to the components local state property. Last but not least let's not forget to dispose the subscription ones the component becomes unbound. This happens by calling the subscriptions `unsubscribe` method.

<code-listing heading="Injecting the store and creating a subscription">
  <source-code lang="TypeScript">

    // app.ts
    import { autoinject } from "aurelia-dependency-injection";
    import { Store } from "aurelia-store";

    import { State } from "./state";

    @autoinject()
    export class App {

      public state: State;
      private subscription: Subscription;

      constructor(private store: Store<State>) {}

      bind() {
        this.subscription = this.store.state.subscribe(
          (state) => this.state = state
        );
      }

      unbind() {
        this.subscription.unsubscribe();
      }
    }
  </source-code>
</code-listing>
<code-listing heading="Injecting the store and creating a subscription">
  <source-code lang="JavaScript">

    // app.js
    import { inject } from "aurelia-dependency-injection";
    import { Store } from "aurelia-store";

    import { State } from "./state";

    @inject(Store)
    export class App {
      constructor(store) {}

      bind() {
        this.subscription = this.store.state.subscribe(
          (state) => this.state = state
        );
      }

      unbind() {
        this.subscription.unsubscribe();
      }
    }
  </source-code>
</code-listing>

> Note that in the TypeScript version we didn't have to type-cast the state variable provided to the next handler since the initial store was injected using the `State` entity as a generic provider.

With that in place the state can be consumed as usual directly from within your template:

<code-listing heading="Subscribing to the state property">
  <source-code lang="HTML">

  <template>
    <h1>Frameworks</h1>

    <ul>
      <li repeat.for="framework of state.frameworks">${framework}</li>
    </ul>
  </template>
  </source-code>
</code-listing>

Since you've subscribed to the state, every new one that arrives will again be assigned to the components `state` property and the UI automatically re-rendered, based on the details that changed.

## Subscribing with the connectTo decorator

In the previous section, you've seen how to manually bind to the state observable for full control.
But instead of handling subscriptions and disposal of those by yourself, you may prefer to use the `connectTo` decorator.
What it does is to connect your store's state automatically to a class property called `state`. It does so by overriding by default the
`bind` and `unbind` life-cycle method for a proper setup and teardown of the state subscription, which will be stored in a property called `_stateSubscription`.

Above ViewModel example could look the following using the connectTo decorator:

<code-listing heading="Using the connectTo decorator">
  <source-code lang="TypeScript">

    // app.ts
    import { autoinject } from "aurelia-dependency-injection";
    import { Store, connectTo } from "aurelia-store";

    import { State } from "./state";

    @autoinject()
    @connectTo()
    export class App {

      public state: State;
      private subscription: Subscription;

      constructor(private store: Store<State>) {}
    }
  </source-code>
</code-listing>
<code-listing heading="Using the connectTo decorator">
  <source-code lang="JavaScript">

    // app.js
    import { inject } from "aurelia-dependency-injection";
    import { Store, connectTo } from "aurelia-store";

    import { State } from "./state";

    @inject(Store)
    @connectTo()
    export class App {
      constructor(store) {}
    }
  </source-code>
</code-listing>

> Notice how we've declared the public state property of type `State` in the TS version. The sole reason for that is to have proper type hinting during compile time.

In case you want to provide a custom selector instead of subscribing to the whole state, you may provide a function, which will receive the store and should return an observable to be used instead of the default `store.state`. The decorator accepts a generic interface which matches your State, for a better TypeScript workflow.

<code-listing heading="Sub-state selection">
  <source-code lang="TypeScript">

    // app.ts
    ...

    @connectTo<State>((store) => store.state.pluck("frameworks"))
    export class App {
      ...
    }
  </source-code>
</code-listing>
<code-listing heading="Sub-state selection">
  <source-code lang="JavaScript">

    // app.js
    ...

    @connectTo((store) => store.state.pluck("frameworks"))
    export class App {
      ...
    }
  </source-code>
</code-listing>

If you need more control and for instance want to override the default target property `state`, you can pass a settings object instead of a function, where the sub-state `selector` matches above function and `target` specifies the new target holding the received state.

<code-listing heading="Defining the selector and target">
  <source-code lang="TypeScript">

    // app.ts
    ...

    @connectTo<State>({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      target: "currentState" // link to currentState instead of state property
    })
    export class App {
      ...
    }
  </source-code>
</code-listing>
<code-listing heading="Defining the selector and target">
  <source-code lang="JavaScript">

    // app.js
    ...

    @connectTo({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      target: "currentState" // link to currentState instead of state property
    })
    export class App {
      ...
    }
  </source-code>
</code-listing>


Not only the target but also the default `setup` and `teardown` methods can be specified, either one or both. The hooks `bind` and `unbind` act as the default value.

<code-listing heading="Overriding the default setup and teardown methods">
  <source-code lang="TypeScript">

    // app.ts
    ...

    @connectTo<State>({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      setup: "create"        // create the subscription inside the create life-cycle hook
      teardown: "deactivate" // do the disposal in deactivate
    })
    export class App {
      ...
    }
  </source-code>
</code-listing>
<code-listing heading="Overriding the default setup and teardown methods">
  <source-code lang="JavaScript">

    // app.js
    ...

    @connectTo({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      setup: "create"        // create the subscription inside the create life-cycle hook
      teardown: "deactivate" // do the disposal in deactivate
    })
    export class App {
      ...
    }
  </source-code>
</code-listing>


> The provided action names for setup and teardown don't necessarily have to be one of the official [lifecycle methods](http://aurelia.io/docs/fundamentals/components#the-component-lifecycle) but should be used as these get called automatically by Aurelia at the proper time.


Last but not least you can also define a callback to be called with the next state once a state change happens
<code-listing heading="Define an onChanged handler">
  <source-code lang="TypeScript">

    // app.ts
    ...

    @connectTo<State>({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      onChanged: "stateChanged"
    })
    export class App {
      ...

      stateChanged(state: State) {
        console.log("The state has changed", state);
      }
    }
  </source-code>
</code-listing>
<code-listing heading="Define an onChanged handler">
  <source-code lang="JavaScript">

    // app.js
    ...

    @connectTo({
      selector: (store) => store.state.pluck("frameworks"), // same as above
      onChanged: "stateChanged"
    })
    export class App {
      ...

      stateChanged(state) {
        console.log("The state has changed", state);
      }
    }
  </source-code>
</code-listing>

> Your onChanged handler will be called before the target property is changed. This way you have access to both the current and previous state.

Next, let's find out how to produce state changes.

## What are actions?

Actions are the primary way to create a new state. They are essentially functions which take the current state and optionally one or more arguments.
Their job is to create the next state and return it. By doing so they should not mutate the passed in current state but instead use immutable functions to create
either a proper clone. The reason for that is that each state represents a unique snapshot of your app in time. By modifying it, you'd alter the state and wouldn't be able to properly compare the old and new state. Further implications by that would be that advanced features such as time-traveling through states wouldn't work anymore.
So keep in mind ... don't mutate your state.

> In case you're not a fan of functional approaches take a look at libraries like [Immer.js](https://github.com/mweststrate/immer), and the [Aurelia store example](https://github.com/zewa666/aurelia-store-examples#immer) using it, to act like you'd mutate the object but secretly get a proper clone.

Continuing with above framework example, an action to add an additional framework would look like the following.
You create a shallow clone of the state by using Object.assign. By saying shallow it means that the actual `frameworks` array in the new state will just reference the original one. So in order to fix that we can use the array spread syntax plus the new `frameworkName` to create a fresh new array.

<code-listing heading="A simple action">
  <source-code lang="TypeScript">

    const demoAction = (state: State, frameworkName: string) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return newState;
    }
  </source-code>
</code-listing>
<code-listing heading="A simple action">
  <source-code lang="JavaScript">

    const demoAction = (state, frameworkName) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return newState;
    }
  </source-code>
</code-listing>

Next, we need to register the created action with the store. That is done by calling the stores `registerAction` method. By doing so we can provide a name which will be used for all kinds of error-handlers, logs, and even Redux DevTools. As a second argument, we pass the action itself. 

<code-listing heading="Registering an action">
  <source-code lang="TypeScript">

    // app.ts
    import { autoinject } from "aurelia-dependency-injection";
    import { Store } from "aurelia-store";

    import { State } from "./state";

    @autoinject()
    export class App {

      public state: State;
      private subscription: Subscription;

      constructor(private store: Store<State>) {
        this.store.registerAction("DemoAction", demoAction);
      }

      ...
    }
  </source-code>
</code-listing>
<code-listing heading="Registering an action">
  <source-code lang="JavaScript">

    // app.js
    import { inject } from "aurelia-dependency-injection";
    import { Store } from "aurelia-store";

    import { State } from "./state";

    @inject(Store)
    export class App {
      constructor(store) {
        this.store.registerAction("DemoAction", demoAction);
      }

      ...
    }
  </source-code>
</code-listing>

You can unregister actions whenever needed by using the stores `unregisterAction` method

<code-listing heading="Unregistering an action">
  <source-code lang="TypeScript">

    // app.ts
    ...

    @autoinject()
    export class App {

      ...

      constructor(private store: Store<State>) {
        this.store.registerAction("DemoAction", demoAction);
        this.store.unregisterAction(demoAction);
      }

      ...
    }
  </source-code>
</code-listing>
<code-listing heading="Unregistering an action">
  <source-code lang="JavaScript">

    // app.js
    ...

    @inject(Store)
    export class App {
      constructor(store) {
        this.store.registerAction("DemoAction", demoAction);
        this.store.unregisterAction(demoAction);
      }

      ...
    }
  </source-code>
</code-listing>

## Async actions

Previously we mentioned that an action should return a state. What we didn't mention is that they are also able to return a promise which will eventually resolve with the new state.

From above example, imagine we'd have to validate the given name, which happens in an async manner.

<code-listing heading="An async action">
  <source-code lang="TypeScript">

    function validateAsync(name: string) {
      return Promise((resolve, reject) => {
        setTimeout(() => {
          if (name === "Angular") {
            reject(new Error("Try using a different framework"))
          } else {
            resolve(name);
          }
        }, 1000);
      })
    }

    const demoAction = async (state: State, frameworkName: string) => {
      const newState = Object.assign({}, state);
      const validatedName = await validateAsync(frameworkName);

      newState.frameworks = [...newState.frameworks, validatedName];

      return newState;
    }
  </source-code>
</code-listing>
<code-listing heading="An async action">
  <source-code lang="JavaScript">

    function validateAsync(name) {
      return Promise((resolve, reject) => {
        setTimeout(() => {
          if (name === "Angular") {
            reject(new Error("Try using a different framework"))
          } else {
            resolve(name);
          }
        }, 1000);
      })
    }

    const demoAction = async (state, frameworkName) => {
      const newState = Object.assign({}, state);
      const validatedName = await validateAsync(frameworkName);

      newState.frameworks = [...newState.frameworks, validatedName];

      return newState;
    }
  </source-code>
</code-listing>

> You're not forced to use async/await but it's highly recommended to use it for better readability wherever you can

## Dispatching actions

So far we've just created an action and registered it by several means. Now let's look at how we can actually execute one of them to trigger the next state change.
We can use the store method `dispatchAction` to exactly do that. In below example the function `dispatchDemo`, can be called with an argument `nextFramework`.
Inside we call `store.dispatchAction`, passing it the action itself and all subsequent parameters required.

<code-listing heading="Dispatching an action">
  <source-code lang="TypeScript">

    // app.ts
    import { autoinject } from "aurelia-dependency-injection";
    import { Store, connectTo } from "aurelia-store";

    import { State } from "./state";

    @autoinject()
    @connectTo()
    export class App {

      public state: State;
      private subscription: Subscription;

      constructor(private store: Store<State>) {
        this.store.registerAction("DemoAction", demoAction);
      }

      public dispatchDemo(nextFramework: string) {
        this.store.dispatchAction(demoAction, nextFramework);
      }
    }
  </source-code>
</code-listing>
<code-listing heading="Dispatching an action">
  <source-code lang="JavaScript">

    // app.js
    import { inject } from "aurelia-dependency-injection";
    import { Store, connectTo } from "aurelia-store";

    import { State } from "./state";

    @inject(Store)
    @connectTo()
    export class App {
      constructor(store) {
        this.store.registerAction("DemoAction", demoAction);
      }

      public dispatchDemo(nextFramework) {
        this.store.dispatchAction(demoAction, nextFramework);
      }
    }
  </source-code>
</code-listing>

Now keep in mind that an action might be async, or really any middleware is, you'll learn more about them later, as such if you're depending on the state being updated right after it, make sure to `await` the call to `dispatchAction`

> Dispatching non-registered actions will result in an error


## Using the dispatchify higher order function

Perhaps you don't want or can't obtain a reference to the store but still would like to dispatch your actions.
This is especially useful if you don't want your child-elements to have any knowledge about the actual logic and just receive actions via attributes. Childs then can call this method directly via the template.
In order to do so you can leverage the higher order function `dispatchify`. What it does is returning a wrapped new function which will obtain the store by itself and forward the provided arguments directly to `store.dispatch`.

<code-listing heading="Forwarding a dispatchable function as argument to child-elements">
  <source-code lang="TypeScript">

    // framework-list.ts
    import { useView } from "aurelia-framework";
    import { dispatchify } from "aurelia-store";

    const addFramework = (state: State, frameworkName: string) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return newState;
    }

    @useView(`
      <template>
        <require from="./framework-item"></require>
        <framework-item add.bind="addFramework"></framework-item>
      </template>
    `)
    export class FrameworkList {
      public addFramework = dispatchify(addFramework);
    }

    // framework-item.ts
    import { bindable, useView } from "aurelia-framework";
    
    @useView(`
      <template>
        New framework name:
        <input value.bind="newFrameworkName" />
        <button click.trigger="add(newFrameworkName)" >Add</button>
      </template>
    `)
    export class FrameworkItem {
      @bindable add;
    }
  </source-code>
</code-listing>
<code-listing heading="Forwarding a dispatchable function as argument to child-elements">
  <source-code lang="JavaScript">

    // framework-list.js
    import { useView } from "aurelia-framework";
    import { dispatchify } from "aurelia-store";

    const addFramework = (state, frameworkName) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return newState;
    }

    @useView(`
      <template>
        <require from="./framework-item"></require>
        <framework-item add.bind="addFramework"></framework-item>
      </template>
    `)
    export class FrameworkList {
      constructor() {
        this.addFramework = dispatchify(addFramework);
      }
    }

    // framework-item.js
    import { bindable, useView } from "aurelia-framework";
    
    @useView(`
      <template>
        New framework name:
        <input value.bind="newFrameworkName" />
        <button click.trigger="add(newFrameworkName)" >Add</button>
      </template>
    `)
    export class FrameworkItem {
      @bindable add;
    }
  </source-code>
</code-listing>

With this approach you can design your custom elements to act either as presentational or container components. For further information take a look at [this article](http://pragmatic-coder.net/using-a-state-container-with-aurelia/).


## Recording a navigable history of the stream of states

Since the whole concept of this plugin is to stream states over time, it makes sense to also keep track of the historical changes. Aurelia Store supports this feature by turning on the history support during the plugin registration.

<code-listing heading="Registering the plugin with history support">
  <source-code lang="TypeScript">
    
    // main.ts
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia: Aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        history: {
          undoable: true <----- REGISTER THE PLUGIN WITH THE HISTORY FEATURE
        }
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>
<code-listing heading="Registering the plugin with history support">
  <source-code lang="JavaScript">
    
    // main.js
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        history: {
          undoable: true <----- REGISTER THE PLUGIN WITH THE HISTORY FEATURE
        }
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>

Now when you subscribe to new state changes, instead of a simple State you'll get a StateHistory<State> object returned, which looks like the following:

```typescript
// aurelia-store -> history.ts
export interface StateHistory<T> {
  past: T[];
  present: T;
  future: T[];
}
```

<code-listing heading="Subscribing to the state history">
  <source-code lang="TypeScript">
    
    // app.ts
    import { autoinject } from "aurelia-framework";
    import { Store, StateHistory } from "aurelia-store";
    import { State } from "./state";
    
    @autoinject()
    export class App {
      constructor(private store: Store<StateHistory<State>>) {
        this.store.registerAction("DemoAction", demoAction);
      }

      attached() {
        this.store.state.subscribe(
          (state: StateHistory<State>) => this.state = state
        );
      }
    }
  </source-code>
</code-listing>
<code-listing heading="Subscribing to the state history">
  <source-code lang="JavaScript">
    
    // app.js
    import { inject } from "aurelia-framework";
    import { Store } from "aurelia-store";
    
    @inject(Store)
    export class App {
      constructor(store) {
        this.store = store;
        this.store.registerAction("DemoAction", demoAction);
      }

      attached() {
        this.store.state.subscribe(
          (state) => this.state = state
        );
      }
    }
  </source-code>
</code-listing>


## Making our app history aware

Now keep in mind that every action will receive a `StateHistory<T>` as input and should return a new `StateHistory<T>`.
You can use the `nextStateHistory` helper function to easily push your new state and create a proper StateHistory representation, which will simply move the currently present state to the past, place your provided one as present and remove the future states.

<code-listing heading="A StateHistory aware action">
  <source-code lang="TypeScript">
    
    // app.ts
    import { nextStateHistory, StateHistory } from "aurelia-store";
    import { State } from "./state";

    const demoAction = (currentState: StateHistory<State>, frameworkName: string) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return nextStateHistory(currentState, {
        frameworks: [...frameworks, frameworkName]
      });
    }

    // The same as returing a handcrafted object like

    const demoAction = (currentState: StateHistory<State>, frameworkName: string) => {
      return Object.assign(
        {},
        currentState,
        { 
          past: [...currentState.past, currentState.present],
          present: { frameworks: [...frameworks, frameworkName] },
          future: [] 
        }
      );
    }
  </source-code>
</code-listing>
<code-listing heading="A StateHistory aware action">
  <source-code lang="JavaScript">
    
    // app.js
    import { nextStateHistory, StateHistory } from "aurelia-store";

    const demoAction = (currentState, frameworkName) => {
      const newState = Object.assign({}, state);
      newState.frameworks = [...newState.frameworks, frameworkName];

      return nextStateHistory(currentState, {
        frameworks: [...frameworks, frameworkName]
      });
    }

    // The same as returing a handcrafted object like

    const demoAction = (currentState, frameworkName) => {
      return Object.assign(
        {},
        currentState,
        { 
          past: [...currentState.past, currentState.present],
          present: { frameworks: [...frameworks, frameworkName] },
          future: [] 
        }
      );
    }
  </source-code>
</code-listing>


### Navigating through history
Having a history of states is great to do state time-travelling. That means defining either a past or future state as the new present. You can do it manually as described in the full-fledged example above and switching states between the properties `past`, `present` and `future`, or you can import the pre-registered action `jump` and pass it either a positive number for traveling into the future or a negative for travelling to past states.

<code-listing heading="Time-travelling states">
  <source-code lang="TypeScript">
    
    // app.ts
    import { autoinject } from "aurelia-framework";
    import { Store, StateHistory, jump } from "aurelia-store";
    import { State } from "./state";
    
    @autoinject()
    export class App {
      constructor(private store: Store<StateHistory<State>>) {
        this.store.registerAction("DemoAction", demoAction);
      }

      attached() {
        this.store.state.subscribe(
          (state: StateHistory<State>) => this.state = state
        );
      }

      backToDinosaurs() {
        // Go back one step in time
        this.store.dispatch(jump, -1);
      }

      backToTheFuture() {
        // Go forward one step to the future
        this.store.dispatch(jump, 1);
      }
    }
  </source-code>
</code-listing>
<code-listing heading="A StateHistory aware action">
  <source-code lang="JavaScript">
    
    // app.js
    import { inject } from "aurelia-framework";
    import { Store, jump } from "aurelia-store";
    
    @inject(Store)
    export class App {
      constructor(store) {
        this.store = store;
        this.store.registerAction("DemoAction", demoAction);
      }

      attached() {
        this.store.state.subscribe(
          (state) => this.state = state
        );
      }

      backToDinosaurs() {
        // Go back one step in time
        this.store.dispatch(jump, -1);
      }

      backToTheFuture() {
        // Go forward one step to the future
        this.store.dispatch(jump, 1);
      }
    }
  </source-code>
</code-listing>

The `jump` action will take care of any potential overflows and return the current history object.


## Limiting the number of history items

Having too many items could result in a memory hit. Thus you can specify the `limit` for when the histories past and future start to overflow.
That means your past and future arrays can hold only a maximum of the provided `limit` and new entries start to drop out, respectively the first or last item of the history stack.

<code-listing heading="Registering the plugin with history overflow limits">
  <source-code lang="TypeScript">
    
    // main.ts
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia: Aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        history: {
          undoable: true,
          limit: 10       <----- LIMIT THE HISTORY TO 10 ENTRIES
        }
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>
<code-listing heading="Registering the plugin with history overflow limits">
  <source-code lang="JavaScript">
    
    // main.js
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        history: {
          undoable: true,
          limit: 10       <----- LIMIT THE HISTORY TO 10 ENTRIES
        }
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>


## Handling side effects with middlewares

Aurelia Store uses a concept of middlewares to handle side-effects. Concept-wise they are similar to Express.js middlewares in that they allow to perform side-effects or manipulate request data. As such they are registered functions, which execute before or after each dispatched action.

A middleware is similar to an action, with the difference that it may return void as well. Middlewares can be executed before the dispatched action, thus potentially manipulating the current state which will be passed to the action, or afterwards, modifying the returned value from the action. If they don't return the previous value will be passed as input. Either way the middleware reducer can be sync as well as async.

> As soon as you have one async middleware registered, essentially all action dispatches will be async as well.

![Chart workflow](./images/middlewares.png)

Middleware are registered using `store.registerMiddleware` with the middlewares function and the placement `before` or `after`. Unregisteration can be done using `store.unregisterMiddleware`

<code-listing heading="Registering a middleware">
  <source-code lang="TypeScript">
    
    // app.ts

    const customLogMiddleware = (currentState: State) => console.log(currentState);
    
    // In TypeScript you can use the exported MiddlewarePlacement string enum
    store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.After);

    
  </source-code>
</code-listing>
<code-listing heading="Registering a middleware">
  <source-code lang="JavaScript">
    
    // app.js

    const customLogMiddleware = (currentState) => console.log(currentState);
    
    // in JavaScript just provide the string "before" or "after"
    store.registerMiddleware(customLogMiddleware, "after");
  </source-code>
</code-listing>


## Accessing the original (unmodified) state in a middleware

When executed, a middleware might accept a second argument which reflects the current unmodified state, the one before any other middlewares or, in case of a after positioning, the result of the dispatched action. This can be useful to determine the state diff that happened in the middleware chain or to reset the next state at certain conditions.

<code-listing heading="Accessing the original state">
  <source-code lang="TypeScript">
    
    // app.ts

    const blacklister = (currentState: TestState, originalState: TestState) => {
      if ( currentState.newValue.indexOf("f**k") > -1 ) {
        return originalState;
      }
    }
  </source-code>
</code-listing>
<code-listing heading="Accessing the original state">
  <source-code lang="JavaScript">
    
    // app.js

    const blacklister = (currentState, originalState) => {
      if ( currentState.newValue.indexOf("f**k") > -1 ) {
        return originalState;
      }
    }
  </source-code>
</code-listing>

## Defining settings for middlewares

Some middlewares require additional configurations in order to work as expected. Above we've looked at a `customLogMiddleware` middleware, which console logs the newly created state. Now if we wanted to control the log type to let's say output to `console.debug` we can make use of middleware settings.
These are passed in as third argument to the middleware function and are registered with `registerMiddlware`.

<code-listing heading="Passing settings to middlewares">
  <source-code lang="TypeScript">
    
    // app.ts

    const customLogMiddleware = (currentState, originalState, settings) => console[settings.logType](currentState);
    
    store.registerMiddleware(customLogMiddleware, MiddlewarePlacement.After, { logType: "debug" });

    
  </source-code>
</code-listing>
<code-listing heading="Passing settings to middlewares">
  <source-code lang="JavaScript">
    
    // app.js

    const customLogMiddleware = (currentState, originalState, settings) => console[settings.logType](currentState);
    
    store.registerMiddleware(customLogMiddleware, "after", { logType: "debug" });
  </source-code>
</code-listing>

## Calling action reference for middlewares

Last but not least the optional forth argument passed into a middleware is the calling action, meaning the action that is dispatched.
In here you get an object containing the actions `name` and the provided `params`. This is useful when you for instance want only certain actions to pass or be canceled under certain circumstances. 

<code-listing heading="Reference to the calling action in middlewares">
  <source-code lang="TypeScript">
    
    // app.ts

    const gateKeeperMiddleware = (currentState, originalState, _, action) => {
      // imagine a lockActive property on the state indicating that certain actions may not be executed
      if (currentState.lockActive === true && action.name === "trespasser") {
        return originalState;
      }
    };
    
    store.registerMiddleware(gateKeeperMiddleware, MiddlewarePlacement.After);
  </source-code>
</code-listing>
<code-listing heading="Reference to the calling action in middlewares">
  <source-code lang="JavaScript">
    
    // app.js

    const gateKeeperMiddleware = (currentState, originalState, _, action) => {
      // imagine a lockActive property on the state indicating that certain actions may not be executed
      if (currentState.lockActive === true && action.name === "trespasser") {
        return originalState;
      }
    };
    
    store.registerMiddleware(gateKeeperMiddleware, "after");
  </source-code>
</code-listing>

## Error propagation with middlewares

By default errors thrown by middlewares will be swallowed in order to guarantee continues states. If you would like to stop state propagation you need to pass in the `propagateError` option set to `true`:

<code-listing heading="Registering the plugin with active error propagation">
  <source-code lang="TypeScript">
    
    // main.ts
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia: Aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        propagateError: true
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>
<code-listing heading="Registering the plugin with active error propagation">
  <source-code lang="JavaScript">
    
    // main.js
    import {Aurelia} from 'aurelia-framework'
    import {initialState} from './state';

    export function configure(aurelia) {
      aurelia.use
        .standardConfiguration()
        .feature('resources');

      ...

      aurelia.use.plugin("aurelia-store", {
        initialState,
        propagateError: true
      });

      aurelia.start().then(() => aurelia.setRoot());
    }
  </source-code>
</code-listing>


## Default middlewares

Aurelia Store comes with a few home-baked middlewares. Others should be added as custom dependencies instead of polluting the overall package size.

### The Logging Middleware

From the previous explanations of the inner workings of middlewares, you've come to learn about the loggingMiddlware. Instead of rebuilding it you can simply import it from Aurelia Store and register it. Remember that you can pass in a settings object to define the logType, which is also defined as string enum in typescript.

<code-listing heading="Registering the Logging middleware">
  <source-code lang="TypeScript">
    
    // app.ts

    import { logMiddleware, LogLevel } from "aurelia-store";

    ...

    store.registerMiddleware(logMiddleware, MiddlewarePlacement.After, { logType: LogLevel.log });
  </source-code>
</code-listing>
<code-listing heading="Registering the Logging middleware">
  <source-code lang="JavaScript">
    
    // app.js

    import { logMiddleware } from "aurelia-store";

    ...

    store.registerMiddleware(logMiddleware, "after", { logType: "log" });
  </source-code>
</code-listing>


### The Local Storage middleware

The `localStorageMiddleware` stores your most recent emitted state in the [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). This is useful when creating apps which should survive a full page refresh. Generally it makes most sense to place the middleware at the end of the queue to get the latest available value stored into localStorage.

In order to make use of it all you need to do is to register it as usual. By default the storage key will be `aurelia-store-state`. You can additionally provide a storage-key via the settings to be used instead.

<code-listing heading="Registering the LocalStorage middleware">
  <source-code lang="TypeScript">
    
    // app.ts

    import { localStorageMiddleware } from "aurelia-store";

    ...

    store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key: "my-storage-key" });
  </source-code>
</code-listing>
<code-listing heading="Registering the LocalStorage middleware">
  <source-code lang="JavaScript">
    
    // app.js

    import { localStorageMiddleware } from "aurelia-store";

    ...

    store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key: "my-storage-key" });
  </source-code>
</code-listing>

Now in order to rehydrate the stored state, all you need to do is to dispatch the provided `rehydrateFromLocalStorage` action which you can import and register as usual. If you used a different key then the default one, just pass it as second argument to the dispatch call.

<code-listing heading="Dispatching the localStorage rehydration action">
  <source-code lang="TypeScript">
    
    // app.ts

    import { rehydrateFromLocalStorage } from "aurelia-store";

    ...

    store.registerAction("Rehydrate", rehydrateFromLocalStorage);
    store.dispatch(rehydrateFromLocalStorage, "my-storage-key");
  </source-code>
</code-listing>
<code-listing heading="Dispatching the localStorage rehydration action">
  <source-code lang="JavaScript">
    
    // app.js

    import { rehydrateFromLocalStorage } from "aurelia-store";

    ...

    store.registerAction("Rehydrate", rehydrateFromLocalStorage);
    store.dispatch(rehydrateFromLocalStorage, "my-storage-key");
  </source-code>
</code-listing>

## Execution order

If multiple actions are dispatched, they will get queued and executed one after another in order to make sure that each dispatch starts with an up to date state.

If either your actions or middlewares return a sync or async value of `false` it will cause the Aurelia Store plugin to interrupt the execution and not emit the next state. Use this behavior in order to avoid unnecessary states. 

## Defining custom LogLevels

## Tracking overall performance

* How performance measurement is done
* At which positions markers are set (diagram)
* Example

## Debugging with the Redux DevTools extension

* Example of using the Redux DevTools with Aurelia Store
* Animated Gifs to highlight features

## Comparison to other state management libraries

### Differences to Redux

### Differences to MobX

### Differences to VueX
