import { BehaviorSubject } from "rxjs";
import { Container } from "aurelia-dependency-injection";
import { getLogger } from "aurelia-logging";
import { PLATFORM } from "aurelia-pal";
import { jump, applyLimits, isStateHistory } from "./history";
import { MiddlewarePlacement } from "./middleware";
import { LogLevel, getLogType } from "./logging";
export var PerformanceMeasurement;
(function (PerformanceMeasurement) {
    PerformanceMeasurement["StartEnd"] = "startEnd";
    PerformanceMeasurement["All"] = "all";
})(PerformanceMeasurement || (PerformanceMeasurement = {}));
export class Store {
    constructor(initialState, options) {
        this.initialState = initialState;
        this.logger = getLogger("aurelia-store");
        this.devToolsAvailable = false;
        this.actions = new Map();
        this.middlewares = new Map();
        this.dispatchQueue = [];
        this.options = options || {};
        const isUndoable = this.options.history && this.options.history.undoable === true;
        this._state = new BehaviorSubject(initialState);
        this.state = this._state.asObservable();
        this.setupDevTools();
        if (isUndoable) {
            this.registerHistoryMethods();
        }
    }
    registerMiddleware(reducer, placement, settings) {
        this.middlewares.set(reducer, { placement, settings });
    }
    unregisterMiddleware(reducer) {
        if (this.middlewares.has(reducer)) {
            this.middlewares.delete(reducer);
        }
    }
    isMiddlewareRegistered(middleware) {
        return this.middlewares.has(middleware);
    }
    registerAction(name, reducer) {
        if (reducer.length === 0) {
            throw new Error("The reducer is expected to have one or more parameters, where the first will be the present state");
        }
        this.actions.set(reducer, { type: name });
    }
    unregisterAction(reducer) {
        if (this.actions.has(reducer)) {
            this.actions.delete(reducer);
        }
    }
    isActionRegistered(reducer) {
        if (typeof reducer === "string") {
            return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
        }
        return this.actions.has(reducer);
    }
    resetToState(state) {
        this._state.next(state);
    }
    dispatch(reducer, ...params) {
        let action;
        if (typeof reducer === "string") {
            const result = Array.from(this.actions)
                .find((val) => val[1].type === reducer);
            if (result) {
                action = result[0];
            }
        }
        else {
            action = reducer;
        }
        return new Promise((resolve, reject) => {
            this.dispatchQueue.push({ reducer: action, params, resolve, reject });
            if (this.dispatchQueue.length === 1) {
                this.handleQueue();
            }
        });
    }
    async handleQueue() {
        if (this.dispatchQueue.length > 0) {
            const queueItem = this.dispatchQueue[0];
            try {
                await this.internalDispatch(queueItem.reducer, ...queueItem.params);
                queueItem.resolve();
            }
            catch (e) {
                queueItem.reject(e);
            }
            this.dispatchQueue.shift();
            this.handleQueue();
        }
    }
    async internalDispatch(reducer, ...params) {
        if (!this.actions.has(reducer)) {
            throw new Error(`Tried to dispatch an unregistered action${reducer ? " " + reducer.name : ""}`);
        }
        PLATFORM.performance.mark("dispatch-start");
        const action = this.actions.get(reducer);
        if (this.options.logDispatchedActions) {
            this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${action.type}`);
        }
        const beforeMiddleswaresResult = await this.executeMiddlewares(this._state.getValue(), MiddlewarePlacement.Before, {
            name: action.type,
            params
        });
        if (beforeMiddleswaresResult === false) {
            PLATFORM.performance.clearMarks();
            PLATFORM.performance.clearMeasures();
            return;
        }
        const result = await reducer(beforeMiddleswaresResult, ...params);
        if (result === false) {
            PLATFORM.performance.clearMarks();
            PLATFORM.performance.clearMeasures();
            return;
        }
        PLATFORM.performance.mark("dispatch-after-reducer-" + action.type);
        if (!result && typeof result !== "object") {
            throw new Error("The reducer has to return a new state");
        }
        let resultingState = await this.executeMiddlewares(result, MiddlewarePlacement.After, {
            name: action.type,
            params
        });
        if (resultingState === false) {
            PLATFORM.performance.clearMarks();
            PLATFORM.performance.clearMeasures();
            return;
        }
        if (isStateHistory(resultingState) &&
            this.options.history &&
            this.options.history.limit) {
            resultingState = applyLimits(resultingState, this.options.history.limit);
        }
        this._state.next(resultingState);
        PLATFORM.performance.mark("dispatch-end");
        if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
            PLATFORM.performance.measure("startEndDispatchDuration", "dispatch-start", "dispatch-end");
            const measures = PLATFORM.performance.getEntriesByName("startEndDispatchDuration");
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${measures[0].duration} of dispatched action ${action.type}:`, measures);
        }
        else if (this.options.measurePerformance === PerformanceMeasurement.All) {
            const marks = PLATFORM.performance.getEntriesByType("mark");
            const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
            this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](`Total duration ${totalDuration} of dispatched action ${action.type}:`, marks);
        }
        PLATFORM.performance.clearMarks();
        PLATFORM.performance.clearMeasures();
        this.updateDevToolsState(action, resultingState);
    }
    executeMiddlewares(state, placement, action) {
        return Array.from(this.middlewares)
            .filter((middleware) => middleware[1].placement === placement)
            .reduce(async (prev, curr, _, _arr) => {
            try {
                const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);
                if (result === false) {
                    _arr = [];
                    return false;
                }
                return result || await prev;
            }
            catch (e) {
                if (this.options.propagateError) {
                    _arr = [];
                    throw e;
                }
                return await prev;
            }
            finally {
                PLATFORM.performance.mark(`dispatch-${placement}-${curr[0].name}`);
            }
        }, state);
    }
    setupDevTools() {
        if (PLATFORM.global.devToolsExtension) {
            this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
            this.devToolsAvailable = true;
            this.devTools = PLATFORM.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
            this.devTools.init(this.initialState);
            this.devTools.subscribe((message) => {
                this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);
                if (message.type === "DISPATCH") {
                    this._state.next(JSON.parse(message.state));
                }
            });
        }
    }
    updateDevToolsState(action, state) {
        if (this.devToolsAvailable) {
            this.devTools.send(action, state);
        }
    }
    registerHistoryMethods() {
        this.registerAction("jump", jump);
    }
}
export function dispatchify(action) {
    const store = Container.instance.get(Store);
    return function (...params) {
        return store.dispatch(action, ...params);
    };
}
//# sourceMappingURL=store.js.map