#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sqrl = require("squirrelly");
if (process.argv.length < 3) {
    console.log("Aurelia-store action scaffold\n[usage]: aurelia-store entityName entityType entityList stateType idName");
    process.exit(0);
}
var entityName = process.argv[2];
var entityType = process.argv[3];
var entityList = process.argv[4];
var stateType = process.argv[5];
var idName = process.argv[6];
var crudTemplateTS = "\nexport function add{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {\n  const clone = Object.assign({}, state, {\n    {{entityList}}: [ ...state, {{entityName}} ]\n  });\n\n  return clone;\n}\n\nexport function remove{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {\n  const clone = Object.assign({}, state, {\n    {{entityList}}: [\n      ...state.{{entityName}}.slice(0, {{entityName}}),\n      ...state.{{entityName}}.slice({{entityName}} + 1)\n    ]\n  });\n\n  return clone;\n}\n\nexport function update{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {\n  const clone = Object.assign({}, state, {\n    {{entityList}}: state.{{entityName}}.map((i) => {\n      return i.{{idName}} === {{entityName}}.{{idName}}\n        ? i\n        : { ...i, {{entityName}} }; \n    })\n  });\n}";
Sqrl.defineFilter("ucFirst", function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
});
var result = Sqrl.Render(crudTemplateTS, {
    entityName: entityName,
    entityType: entityType,
    entityList: entityList,
    stateType: stateType,
    idName: idName
});
console.log(result);
//# sourceMappingURL=cli.js.map