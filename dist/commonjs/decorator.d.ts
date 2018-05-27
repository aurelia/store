import { Observable } from "rxjs";
import { Store } from "./store";
export interface ConnectToSettings<T, R = T | any> {
    onChanged?: string;
    selector: ((store: Store<T>) => Observable<R>);
    setup?: string;
    target?: string;
    teardown?: string;
}
export declare function connectTo<T, R = any>(settings?: ((store: Store<T>) => Observable<R>) | ConnectToSettings<T, R>): (target: any) => void;
