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
      { file: "dist/es2017/aurelia-store.js", format: "es" }
    ]
  },
  es2015: {
    input: ENTRY_PATH,
    outputs: [
      { file: "dist/es2015/aurelia-store.js", format: "es" },
      {
        file: "dist/umd-es2015/aurelia-store.js",
        format: "umd",
        name: "au.store",
        globals: {
          "aurelia-framework": "au",
          "aurelia-dependency-injection": "au",
          "aurelia-logging": "au.LogManager",
          "aurelia-pal": "au",
          "rxjs": "rxjs",
          "rxjs/operators": "rxjs"
        }
      }
    ]
  },
  es5: {
    input: ENTRY_PATH,
    outputs: [
      { file: "dist/commonjs/aurelia-store.js", format: "cjs" },
      { file: "dist/amd/aurelia-store.js", format: "amd", amd: { id: LIB_NAME } },
      { file: "dist/native-modules/aurelia-store.js", format: "es" },
      {
        file: "dist/umd/aurelia-store.js",
        format: "umd",
        name: "au.store",
        globals: {
          "aurelia-framework": "au",
          "aurelia-dependency-injection": "au",
          "aurelia-logging": "au.LogManager",
          "aurelia-pal": "au",
          "rxjs": "rxjs",
          "rxjs/operators": "rxjs"
        }
      }
    ]
  }
}

const targetFormats: IBuildTargetFormat[] = args.format || ["es2015", "es2017", "es5"];
Promise
  .all(targetFormats.map(target => {
    const { outputs, ...options } = (configs as any)[target];
    return build(
      target,
      { ...options, external: EXTERNAL_LIBS }, outputs as rollup.OutputOptions[]
    );
  }))
  .then(() => generateDts())
  .catch(ex => {
    console.log(ex);
  });
