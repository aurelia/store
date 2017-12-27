import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import "rxjs/add/operator/delay";
import { Store } from "./store";
export declare type StepFn<T> = (res: T) => void;
export declare function executeSteps<T>(store: Store<T>, shouldLogResults: boolean, ...steps: StepFn<T>[]): Promise<{}>;
