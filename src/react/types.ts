// React types for optional React support
export interface ReactType {
  useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  useCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
  useRef: <T>(initialValue: T) => { current: T };
  useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  useContext: <T>(context: ReactContext<T>) => T;
  createContext: <T>(defaultValue: T) => ReactContext<T>;
  createElement: (type: any, props: any, ...children: any[]) => any;
}

export interface ReactContext<T> {
  Provider: ReactProvider<T>;
  Consumer: ReactConsumer<T>;
}

export interface ReactProvider<T> {
  (props: { value: T; children: any }): any;
}

export interface ReactConsumer<T> {
  (props: { children: (value: T) => any }): any;
}

export interface ReactNode {
  // React node type definition
}