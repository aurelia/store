<a name="0.26.0"></a>
# 0.26.0 (2018-07-24)


### Bug Fixes

* **cli:** add missing cli auto configuration options ([2f58ce8](https://github.com/aurelia/store/commit/2f58ce8))
* **cli:** auto-cli install fixed for rxjs v6 ([f3e89da](https://github.com/aurelia/store/commit/f3e89da))
* **connectTo:** call handler before state assignment ([3c27c8a](https://github.com/aurelia/store/commit/3c27c8a))
* **decorator:** better return types for decorator connectTo ([6b81e3b](https://github.com/aurelia/store/commit/6b81e3b))
* **decorator:** return original setup/teardown result ([af9db1b](https://github.com/aurelia/store/commit/af9db1b))
* **dispatchify:** return promise from decorator ([c775f18](https://github.com/aurelia/store/commit/c775f18))
* **middleware:** async waits ([43131a6](https://github.com/aurelia/store/commit/43131a6))
* **pal:** update pal for proper performance api testing ([35d6db6](https://github.com/aurelia/store/commit/35d6db6))
* **ssr:** remove direct access to window global ([21049e2](https://github.com/aurelia/store/commit/21049e2))
* **store:** proper return type for dispatch ([0dcfcdf](https://github.com/aurelia/store/commit/0dcfcdf))
* **store:** use registered name; refactor ([170b631](https://github.com/aurelia/store/commit/170b631))
* **test:** properly expose test-helpers ([637a2c1](https://github.com/aurelia/store/commit/637a2c1))


### Chores

* **release:** new rxjs release ([593d4e9](https://github.com/aurelia/store/commit/593d4e9))


### Code Refactoring

* **types:** saner typesafety ([fd6fcea](https://github.com/aurelia/store/commit/fd6fcea))


### Features

* **actions:** unregistering actions ([296ecf0](https://github.com/aurelia/store/commit/296ecf0))
* **all:** upgrade to `rxjs@6.2.0` ([598082a](https://github.com/aurelia/store/commit/598082a))
* **connecTo:** setup and teardown functions ([8acfc89](https://github.com/aurelia/store/commit/8acfc89))
* **connectTo:** onChanged callback ([d648391](https://github.com/aurelia/store/commit/d648391))
* **connectTo:** support multiple selectors ([4b6ee0a](https://github.com/aurelia/store/commit/4b6ee0a)), closes [#36](https://github.com/aurelia/store/issues/36)
* **decorator:** complex settings object added ([0141dce](https://github.com/aurelia/store/commit/0141dce))
* **decorator:** connectTo decorator ([61a1061](https://github.com/aurelia/store/commit/61a1061))
* **dispatch:** dispatch by registered name ([49f498e](https://github.com/aurelia/store/commit/49f498e))
* **dispatch:** error on unregistered dispatch ([5188148](https://github.com/aurelia/store/commit/5188148))
* **dispatch:** pass additional arguments to reducer ([c8d4840](https://github.com/aurelia/store/commit/c8d4840))
* **dispatch:** propagateError option ([d5a0a80](https://github.com/aurelia/store/commit/d5a0a80))
* **dispatch:** queued execution of dispatch ([5e63dea](https://github.com/aurelia/store/commit/5e63dea))
* **history:** add time-traveling feature ([b8d3d85](https://github.com/aurelia/store/commit/b8d3d85))
* **history:** added next state creation helper ([b614603](https://github.com/aurelia/store/commit/b614603))
* **history:** history overflow via limit ([c005758](https://github.com/aurelia/store/commit/c005758))
* **logging:** custom loglevels for various features ([8aaca77](https://github.com/aurelia/store/commit/8aaca77))
* **middleware:** configurable localStorage middleware ([493cede](https://github.com/aurelia/store/commit/493cede))
* **middleware:** localStorage middleware and action added ([5713cf9](https://github.com/aurelia/store/commit/5713cf9))
* **middleware:** log middleware settings ([2a8abbb](https://github.com/aurelia/store/commit/2a8abbb))
* **middleware:** originalState for after middleware ([865b6de](https://github.com/aurelia/store/commit/865b6de))
* **middleware:** pass original state to all middleware positions ([b9a8b29](https://github.com/aurelia/store/commit/b9a8b29))
* **middleware:** provide calling action name and params ([82736eb](https://github.com/aurelia/store/commit/82736eb))
* **middleware:** register middleware settings ([d224a77](https://github.com/aurelia/store/commit/d224a77))
* **middleware:** support middleware registration ([6927513](https://github.com/aurelia/store/commit/6927513))
* **middleware:** unregister middleware ([1ac79b8](https://github.com/aurelia/store/commit/1ac79b8))
* **performance:** added perf measurement option ([5578200](https://github.com/aurelia/store/commit/5578200))
* **reducer:** stoppable reducers ([0be79a7](https://github.com/aurelia/store/commit/0be79a7))
* **store:** check for registered actions and middlewares ([332a088](https://github.com/aurelia/store/commit/332a088))
* **store:** dispatchify helper added ([3458b22](https://github.com/aurelia/store/commit/3458b22))
* **store:** promise support; error-handling ([e146dee](https://github.com/aurelia/store/commit/e146dee))
* **test:** added test helper for sequences ([7b29473](https://github.com/aurelia/store/commit/7b29473))
* **undo:** added undo-redo feature ([1ca6a8f](https://github.com/aurelia/store/commit/1ca6a8f))


### BREAKING CHANGES

* **release:** updated to new major RxJS version ^6.2.0
* **dispatch:** * Dispatches are now queued and do not run in parallel
* plugin initialization parameters changed
* after middlewares are awaited now
* **dispatch:** Dispatching unregistered actions will throw an error
* **types:** * NextState is dropped
* Plugin initialization handles lifting of state to statehistory for initial state, but the store itself doesn't anymore.



<a name="0.25.0"></a>
# [0.25.0](https://github.com/aurelia/store/compare/v0.23.3...v0.25.0) (2018-07-18)


### Bug Fixes

* **cli:** auto-cli install fixed for rxjs v6 ([f3e89da](https://github.com/aurelia/store/commit/f3e89da))


### Chores

* **release:** new rxjs release ([593d4e9](https://github.com/aurelia/store/commit/593d4e9))


### Features

* **all:** upgrade to `rxjs@6.2.0` ([598082a](https://github.com/aurelia/store/commit/598082a))
* **store:** check for registered actions and middlewares ([332a088](https://github.com/aurelia/store/commit/332a088))


### BREAKING CHANGES

* **release:** updated to new major RxJS version ^6.2.0



