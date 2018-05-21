import { Observable } from "rxjs/Observable";
import { Store } from "./store";
export interface ConnectToSettings<T> {
    onChanged?: string;
    selector: (store: Store<T>) => Observable<T>;
    setup?: string;
    target?: string;
    teardown?: string;
}
export declare function connectTo<T>(settings?: ((store: Store<T>) => Observable<T>) | ConnectToSettings<T>): (target: any) => void;
