import rollup from "rollup";
import { build, generateDts, IBuildTargetFormat } from "./shared";
import { args } from "./args";
import packageJson from "../package.json";

const LIB_NAME = "aurelia-store";
const ENTRY_PATH = "src/aurelia-store.ts";
const EXTERNAL_LIBS = Object
  .keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
  .filter(dev => /^(?:aurelia|rxjs)/.test(dev))
  // rxjs/operators is considered a different module
  // and cannot be resolved by rollup. Add this to avoid warning
  .concat("rxjs/operators");
const configs = {
  es2017: {
    input: ENTRY_PATH,
    outputs: [
      { file: "dist/es2017/index.js", format: "es" }
    ]
  },
  es2015: {
    input: ENTRY_PATH,
    outputs: [
      { file: "dist/es2015/index.js", format: "es" }
    ]
  },
  es5: {
    input: ENTRY_PATH,
    outputs: [
      { file: "dist/commonjs/index.js", format: "cjs" },
      { file: "dist/amd/index.js", format: "amd", amd: { id: LIB_NAME } },
      { file: "dist/native-modules/index.js", format: "es" }
    ]
  }
}

const targetFormats: IBuildTargetFormat[] = args.format || ["es5", "es2015", "es2017"];
Promise
  .all(targetFormats.map(target => {
    const { outputs, ...options } = configs[target];
    return build(target, { ...options, external: EXTERNAL_LIBS }, outputs as rollup.OutputOptionsFile[]);
  }))
  .then(() => generateDts())
  .catch(ex => {
    console.log(ex);
  });
