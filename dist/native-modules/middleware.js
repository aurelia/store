export var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
export function logMiddleware(state) {
    console.log("New state: ", state);
}
export function localStorageMiddleware(state, _, settings) {
    if (window.localStorage) {
        var key = settings && settings.key && typeof settings.key === "string"
            ? settings.key
            : "aurelia-store-state";
        window.localStorage.setItem(key, JSON.stringify(state));
    }
}
export function rehydrateFromLocalStorage(state, key) {
    if (!window.localStorage) {
        return state;
    }
    var storedState = window.localStorage.getItem(key || "aurelia-store-state");
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