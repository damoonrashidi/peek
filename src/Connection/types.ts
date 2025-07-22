export interface Workspace {
  name: string;
  connections: Connection[];
}

export interface Connection {
  name: string;
  url: string;
  color: string;
}
