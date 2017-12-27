define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function jump(state, n) {
        if (!isStateHistory(state)) {
            return state;
        }
        if (n > 0)
            return jumpToFuture(state, n - 1);
        if (n < 0)
            return jumpToPast(state, state.past.length + n);
        return state;
    }
    exports.jump = jump;
    function jumpToFuture(state, index) {
        if (index < 0 || index >= state.future.length) {
            return state;
        }
        var past = state.past, future = state.future, present = state.present;
        var newPast = past.concat([present], future.slice(0, index));
        var newPresent = future[index];
        var newFuture = future.slice(index + 1);
        return { past: newPast, present: newPresent, future: newFuture };
    }
    function jumpToPast(state, index) {
        if (index < 0 || index >= state.past.length) {
            return state;
        }
        var past = state.past, future = state.future, present = state.present;
        var newPast = past.slice(0, index);
        var newFuture = past.slice(index + 1).concat([present], future);
        var newPresent = past[index];
        return { past: newPast, present: newPresent, future: newFuture };
    }
    function nextStateHistory(presentStateHistory, nextPresent) {
        return Object.assign({}, presentStateHistory, {
            past: presentStateHistory.past.concat([presentStateHistory.present]),
            present: nextPresent,
            future: []
        });
    }
    exports.nextStateHistory = nextStateHistory;
    function applyLimits(state, limit) {
        if (isStateHistory(state)) {
            if (state.past.length > limit) {
                state.past = state.past.slice(state.past.length - limit);
            }
            if (state.future.length > limit) {
                state.future = state.future.slice(0, limit);
            }
        }
        return state;
    }
    exports.applyLimits = applyLimits;
    function isStateHistory(history) {
        return typeof history.present !== "undefined" &&
            typeof history.future !== "undefined" &&
            typeof history.past !== "undefined" &&
            Array.isArray(history.future) &&
            Array.isArray(history.past);
    }
    exports.isStateHistory = isStateHistory;
});
