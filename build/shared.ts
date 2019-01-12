import * as rollup from "rollup";
import typescript from "rollup-plugin-typescript2";
import rimraf from "rimraf";
import ChildProcess from "child_process";


export type IBuildTargetFormat = "es5" | "es2015" | "es2017" | "umd";

export async function build(
  target: IBuildTargetFormat,
  options: rollup.RollupFileOptions,
  outputs: rollup.OutputOptionsFile[]
): Promise<void> {
  return rollup
    .rollup({
      ...options,
      plugins: [
        typescript({
          tsconfigOverride: {
            compilerOptions: {
              target: target
            }
          },
          cacheRoot: ".rollupcache"
        }) as rollup.Plugin,
        ...(options.plugins || []),
      ]
    })
    .then(bundle => Promise.all(outputs.map(output => bundle.write(output))))
    .then(() => {
      console.log(`Built [${target}] successfully.`);
    });
}

export async function clean(): Promise<void> {
  console.log("\n==============\nCleaning dist folder...\n==============");
  return new Promise<void>(resolve => {
    rimraf("dist", (error) => {
      if (error) {
        throw error;
      }
      resolve();
    });
  });
}

export async function generateDts(): Promise<void> {
  console.log("\n==============\nGenerating dts bundle...\n==============");
  return new Promise<void>(resolve => {
    ChildProcess.exec("npm run bundle-dts", (err, stdout, stderr) => {
      if (err || stderr) {
        console.log("Generating dts error:");
        console.log(stderr);
      } else {
        console.log("Generated dts bundle successfully");
        console.log(stdout);
      }
      resolve();
    });
  });
};
