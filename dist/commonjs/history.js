"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jump(state, n) {
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
    var _a = state, past = _a.past, future = _a.future, present = _a.present;
    var newPast = past.concat([present], future.slice(0, index));
    var newPresent = future[index];
    var newFuture = future.slice(index + 1);
    return { past: newPast, present: newPresent, future: newFuture };
}
function jumpToPast(state, index) {
    if (index < 0 || index >= state.past.length) {
        return state;
    }
    var _a = state, past = _a.past, future = _a.future, present = _a.present;
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
