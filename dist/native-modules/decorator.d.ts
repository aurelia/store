import { Store } from './store';
import { Observable } from 'rxjs/Observable';
export declare function connectTo<T>(settings?: (store: Store<T>) => Observable<T>): (target: any) => void;
