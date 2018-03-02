import { Observable } from "rxjs/Observable";
import { Store } from "./store";
export declare function connectTo<T>(settings?: (store: Store<T>) => Observable<T>): (target: any) => void;
