import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { 
  autoinject,
  LogManager
} from "aurelia-framework";

@autoinject()
export class Store<T> {
  // Aurelia logging helper
  public logger = LogManager.getLogger("aurelia-store");

  // Redux-DevTools? Hell yeah
  public devToolsAvailable: boolean = false;
  public devTools: any;

  // our initial state
  public initialState: T;

  public actions: Map<(state: T) => T, { name: string, reducer: (state: T) => T}> = new Map();

  public readonly state: Observable<T>;
  private _state: BehaviorSubject<T>;

  // extract implementations into a simple service
  // this way you can leverage both a observable and traditional style
  constructor(initialState: T) {
    this.initialState = initialState;
    this._state = new BehaviorSubject(this.initialState);
    this.state = this._state.asObservable();
    
    this.setupDevTools();
  }

  public registerAction(name: string, reducer: (state: T) => T) {
    this.actions.set(reducer, { name, reducer });
  }

  public dispatch(reducer: (state: T) => T) {
    if (this.actions.has(reducer)) {
      const action = this.actions.get(reducer);
      const newState = action!.reducer(this._state.getValue());
      this._state.next(newState);

      this.updateDevToolsState(action!.name, newState);
    }
  }

  /* ACTIONS */
  private setupDevTools() {
    // check whether the user has the Redux-DevTools browser extension installed
    if ((<any>window).devToolsExtension) {
      this.logger.info("DevTools are available");
      this.devToolsAvailable = true;

      // establish a connection with the DevTools
      this.devTools = (<any>window).__REDUX_DEVTOOLS_EXTENSION__.connect();

      // set the initial state
      this.devTools.init(this.initialState);

      // subscribe to changes, e.g navigation from within the DevTools
      this.devTools.subscribe((message: any) => {
        this.logger.debug(`DevTools sent change ${message.type}`);

        if (message.type === "DISPATCH") {
          // the state is sent as string, so don't forget to parse it :)
          this._state.next(JSON.parse(message.state));
        }
      });
    }
  }

  private updateDevToolsState(action: string, state: T) {
    // if the Redux-DevTools are available, sync the states
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }
}
