import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/delay";

import { Store, NextState } from "./store";


export type StepFn<T> = (res: NextState<T>) => void;

export async function executeSteps<T>(store: Store<T>, shouldLogResults: boolean, ...steps: StepFn<T>[]) {
  const logStep = (step: StepFn<T>, stepIdx: number) => (res: NextState<T>) => {
    if (shouldLogResults) {
      console.group(`Step ${stepIdx}`)
      console.log(res);
      console.groupEnd();
    }
    step(res);
  };

  // tslint:disable-next-line:no-any
  const tryStep = (step: StepFn<T>, reject: (reason?: any) => void) =>
    (res: NextState<T>) => {
      try {
        step(res as any);
      } catch (err) {
        reject(err);
      }
    };

  const lastStep = (step: StepFn<T>, resolve: () => void) =>
    (res: NextState<T>) => {
      step(res as any);
      resolve();
    };

  return new Promise((resolve, reject) => {
    let currentStep = 0;

    steps.slice(0, -1).forEach((step) => {
      store.state.skip(currentStep).take(1).delay(0).subscribe(tryStep(logStep(step, currentStep), reject));
      currentStep++;
    });

    store.state.skip(currentStep).take(1).subscribe(
      lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
  });
}
