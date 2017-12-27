export var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
export function logMiddleware(state) {
    console.log("New state: ", state);
}
export function localStorageMiddleware(state) {
    if (window.localStorage) {
        window.localStorage.setItem("aurelia-store-state", JSON.stringify(state));
    }
}
export function rehydrateFromLocalStorage(state) {
    if (!window.localStorage) {
        return state;
    }
    var storedState = window.localStorage.getItem("aurelia-store-state");
    if (!storedState) {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch (e) { }
    return state;
}
