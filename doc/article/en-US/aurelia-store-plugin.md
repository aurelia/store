---
name: Managing App State
description: Using the Aurelia Store plugin for predictable state management.
author: Vildan Softic (http://github.com/zewa666)
---
## Introduction

This article covers the Store plugin for Aurelia. It is built on top of two core features of [RxJS](http://reactivex.io/rxjs/), namely Observables and the BehaviorSubject. You're not forced to delve into the reactive universe, in fact you'll barely notice it at the begin, but certainly can benefit a lot when using it wisely.

Various examples, demonstrating individual pieces of the plugin, can be found in the [samples repository](https://github.com/zewa666/aurelia-store-examples).

### Reasons for state management

Currently lot of modern development approaches leverage a single store, which acts as a central basis of your app. The idea is that it holds all data, that makes up your application. The content of your store is your application's state. If you will, the app state is a snapshot of data at a specific moment in time. You modify that by using Actions, which are the only way to manipulate the global state, and create the next app state.

Contrast this to classic service oriented approaches, where data is split amongst several service entities. What turns out to be a simpler approach in the beginning, especially combined with a powerful IoC Container, can become a problem once the apps size grows. Not only do you start to get increased complexity and inter-dependency of your services, but keeping track of who modified what and how to notify every component about a change can become tricky.

Leveraging a single store approach, there is only one source of truth for your data and all modifications happen in a predictable way, potentially leading to a *more* side-effect-free overall application.

### Why is RxJS utilized for this plugin?

* Chart of Store -> Subscription -> Action -> and back
* Why RxJS is used (Reactive approach [cycles of states])
* Benefits of a stream of states over time

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
