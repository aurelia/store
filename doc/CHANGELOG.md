<a name="1.3.4"></a>
## [1.3.4](https://github.com/aurelia/store/compare/1.3.3...1.3.4) (2019-04-15)


### Bug Fixes

* **dist:** add umd-es2015, adjust unpkg field, umd build to es5 ([741026c](https://github.com/aurelia/store/commit/741026c))



<a name="1.3.3"></a>
## [1.3.3](https://github.com/aurelia/store/compare/1.3.2...1.3.3) (2019-02-14)



<a name="1.3.2"></a>
## [1.3.2](https://github.com/aurelia/store/compare/1.3.1...1.3.2) (2019-01-19)


### Bug Fixes

* **build:** adjust global namespace of rxjs ([b8da685](https://github.com/aurelia/store/commit/b8da685))
* **build:** revert rxjs namespace ([44a7ba9](https://github.com/aurelia/store/commit/44a7ba9))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/aurelia/store/compare/1.2.0...1.3.0) (2018-11-02)


### Bug Fixes

* **build:** adjust build scripts ([bafb8af](https://github.com/aurelia/store/commit/bafb8af))
* **devtools:** action params are optional ([64fb9e4](https://github.com/aurelia/store/commit/64fb9e4))
* **doc:** fix html5 syntax ([8c8ff5f](https://github.com/aurelia/store/commit/8c8ff5f))
* **npm:** keep ability to build in dist ([b8fbd87](https://github.com/aurelia/store/commit/b8fbd87))
* **options:** history is optional ([4171917](https://github.com/aurelia/store/commit/4171917))
* **store:** revert instance registration, jspm pointer fix ([cc8eff2](https://github.com/aurelia/store/commit/cc8eff2))


### Features

* **devtools:** Add action params to the devtools Action view ([c8a3277](https://github.com/aurelia/store/commit/c8a3277)), closes [#75](https://github.com/aurelia/store/issues/75)
* **store:** allow devtools to be disabled ([fac79a0](https://github.com/aurelia/store/commit/fac79a0))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/aurelia/store/compare/1.1.0...1.2.0) (2018-10-08)


### Bug Fixes

* **store:** Narrow dependency importing to improve commonjs bundling ([23c16f9](https://github.com/aurelia/store/commit/23c16f9))


### Features

* **store:** resetToState public api ([e2214c6](https://github.com/aurelia/store/commit/e2214c6))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/aurelia/store/compare/1.0.0...1.1.0) (2018-08-25)


### Features

* **DevTools:** add all options ([20c6adc](https://github.com/aurelia/store/commit/20c6adc))



<a name="1.0.0"></a>
# 1.0.0 (2018-08-09)


### Bug Fixes

* **cli:** add missing cli auto configuration options ([2f58ce8](https://github.com/aurelia/store/commit/2f58ce8))
* **cli:** auto-cli install fixed for rxjs v6 ([f3e89da](https://github.com/aurelia/store/commit/f3e89da))
* **connectTo:** call handler before state assignment ([3c27c8a](https://github.com/aurelia/store/commit/3c27c8a))
* **decorator:** better return types for decorator connectTo ([6b81e3b](https://github.com/aurelia/store/commit/6b81e3b))
* **decorator:** proper error on missing polyfill ([40827a0](https://github.com/aurelia/store/commit/40827a0))
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
* **decorator:** multiple selectors ([88fd6c3](https://github.com/aurelia/store/commit/88fd6c3))
* **DevTools:** options to configure the Redux DevTools communication ([3aa2c18](https://github.com/aurelia/store/commit/3aa2c18))
* **dispatch:** dispatch by registered name ([49f498e](https://github.com/aurelia/store/commit/49f498e))
* **dispatch:** error on unregistered dispatch ([5188148](https://github.com/aurelia/store/commit/5188148))
* **dispatch:** pass additional arguments to reducer ([c8d4840](https://github.com/aurelia/store/commit/c8d4840))
* **dispatch:** propagateError option ([d5a0a80](https://github.com/aurelia/store/commit/d5a0a80))
* **dispatch:** queued execution of dispatch ([5e63dea](https://github.com/aurelia/store/commit/5e63dea))
* **dispatchify:** type-safe arguments ([4020b93](https://github.com/aurelia/store/commit/4020b93))
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
* **TS:** typesafe dispatch ([f2c4f18](https://github.com/aurelia/store/commit/f2c4f18))
* **undo:** added undo-redo feature ([1ca6a8f](https://github.com/aurelia/store/commit/1ca6a8f))


### BREAKING CHANGES

* **TS:** From here on the plugin requires TS >= 3.0.0

related issue https://github.com/aurelia/store/issues/53
* **release:** updated to new major RxJS version ^6.2.0
* **dispatch:** * Dispatches are now queued and do not run in parallel
* plugin initialization parameters changed
* after middlewares are awaited now
* **dispatch:** Dispatching unregistered actions will throw an error
* **types:** * NextState is dropped
* Plugin initialization handles lifting of state to statehistory for initial state, but the store itself doesn't anymore.



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



