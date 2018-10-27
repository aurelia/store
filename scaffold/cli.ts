#!/usr/bin/env node

import * as Sqrl from "squirrelly";

if (process.argv.length < 3) {
  console.log("Aurelia-store action scaffold\n[usage]: aurelia-store entityName entityType entityList stateType idName");
  process.exit(0);
}

const entityName = process.argv[2];
const entityType = process.argv[3];
const entityList = process.argv[4];
const stateType = process.argv[5];
const idName = process.argv[6];

const crudTemplateTS = `
export function add{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {
  const clone = Object.assign({}, state, {
    {{entityList}}: [ ...state, {{entityName}} ]
  });

  return clone;
}

export function remove{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {
  const clone = Object.assign({}, state, {
    {{entityList}}: [
      ...state.{{entityName}}.slice(0, {{entityName}}),
      ...state.{{entityName}}.slice({{entityName}} + 1)
    ]
  });

  return clone;
}

export function update{{entityName|ucFirst}}(state: {{stateType}}, {{entityName}}: {{entityType}}) {
  const clone = Object.assign({}, state, {
    {{entityList}}: state.{{entityName}}.map((i) => {
      return i.{{idName}} === {{entityName}}.{{idName}}
        ? i
        : { ...i, {{entityName}} }; 
    })
  });
}`;

Sqrl.defineFilter("ucFirst", function (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
})

const result = Sqrl.Render(crudTemplateTS, {
  entityName,
  entityType,
  entityList,
  stateType,
  idName
});

console.log(result);
