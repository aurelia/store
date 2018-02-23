---
name: Managing App State
description: Using the Aurelia Store plugin for predictable state management.
author: Vildan Softic (http://github.com/zewa666)
---
## Introduction

* Intro text
* Reasons for state management
* Why RxJS is used (Reactive approach [cycles of states])
* Benefits of a stream of states over time

Various examples, demonstrating individual pieces of the plugin, can be found in the [samples repository](https://github.com/zewa666/aurelia-store-examples).

## Getting Started

Install the npm dependency via

```Shell
npm install aurelia-store
```

If your app is based on the Aurelia CLI and the build is based on RequireJS or SystemJS, you can setup the plugin using the following automatic dependency import:

```Shell
au import aurelia-store
```

alternatively you can manually add these dependencies to your vendor bundle:

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

Once you've got the plugin installed, it needs to be configured in your app.

## What is the State?

* Explain what the state object is about
* Reasons for an initial state
* Best practices for structuring state (what does belong into global state)
* Explain the benefits of having a typed store

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

With this done we're ready to consume our state and dive into the world of state management.

## Subscribing to the stream of states

* Dependency injection of the Store
* Typesafety with the State
* Creating a subscription
* Unsubscribing on element detach

## What are actions?

* What is an action
* Type of actions
* Actions are registered in the store
* Parametrized actions

## Creating your first action

* Explain how to define a simple action
* Explain reasons for immutability
* Sample with Object.assign
* Mention deep cloning
* Show immer.js as an alternative

## Async actions

## Execution order

* Explain the ordered execution, even of async actions
* The app can be seen as a loop of state changes

## Dispatching actions

* How to dispatch simple actions
* How to pass parameters
* How to wait for the end of one dispatch cycle

## Using the dispatchy higher order function

* Show how to create a dispatchified action
* Demonstrate on example where an action is passed into a child as custom attribute
* Presentational / Structural <--> Dumb / Smart components 


## Recording a navigatable history of the stream of states

* Why History support
* How does it work
* Use cases

## Making our app history aware

* Show how to transform the current state entity into a history enhanced once

## Limiting the number of history items

## Handling side effects with middlewares

* What is a middleware
* Middleware positions
* Diagram depicting the execution flow
* Explain why they don't need to return anything

## Accessing the original (unmodified) state in a middleware

* Use cases and example for having the unmodified original state

## Defining settings for middlewares

* How to configure them
* How to consume them

## Error propagation with middlewares

* Middlwares silently swallow errors
* Explain how to turn on error propagation

## Default middlewares

### The Logging Middleware

### The Local Storage middlware

## Defining custom LogLevels

## Tracking overall performance

* How performance measurement is done
* At which positions markers are set (diagram)
* Example

## Debugging with the Redux DevTools extension

* Example of using the Redux DevTools with Aurelia Store
* Animated Gifs to highlight features

## Comparision to other state management libraries

### Differences to Redux

### Differences to MobX

### Differences to VueX
