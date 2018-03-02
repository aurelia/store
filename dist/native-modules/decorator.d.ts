import { Observable } from "rxjs/Observable";
import { Store } from "./store";
export interface ConnectToSettings<T> {
    selector: (store: Store<T>) => Observable<T>;
    target?: string;
}
export declare function connectTo<T>(settings?: ((store: Store<T>) => Observable<T>) | ConnectToSettings<T>): (target: any) => void;
