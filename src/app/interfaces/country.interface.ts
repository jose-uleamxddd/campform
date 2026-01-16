export interface Country {
    name: Name;
    cca2: string;
    borders: string[];
}

export interface Name {
    common: string;
    official: string;
    nativeName: { [key: string]: NativeName };
}

export interface NativeName {
    official: string;
    common: string;
}

export interface State {
  id: number;
  name: string;
  state_code: string;
}
