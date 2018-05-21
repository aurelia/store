import { PLATFORM } from "aurelia-pal";
export var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
export function logMiddleware(state, _, settings) {
    if (settings && settings.logType && console.hasOwnProperty(settings.logType)) {
        console[settings.logType]("New state: ", state);
    }
    else {
        console.log("New state: ", state);
    }
}
export function localStorageMiddleware(state, _, settings) {
    if (PLATFORM.global.localStorage) {
        const key = settings && settings.key && typeof settings.key === "string"
            ? settings.key
            : "aurelia-store-state";
        PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
    }
}
export function rehydrateFromLocalStorage(state, key) {
    if (!PLATFORM.global.localStorage) {
        return state;
    }
    const storedState = PLATFORM.global.localStorage.getItem(key || "aurelia-store-state");
    if (!storedState) {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch (e) { }
    return state;
}
//# sourceMappingURL=middleware.js.map