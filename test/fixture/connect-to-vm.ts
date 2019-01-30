import { inlineView } from "aurelia-framework";
import { connectTo } from "../../src/aurelia-store";

@inlineView(`<template></template>`)
@connectTo()
export class ConnectToVm {

}
