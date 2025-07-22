import { atomWithStorage } from "jotai/utils";
import { Connection, Workspace } from "./types";
import { TLEditorSnapshot } from "tldraw";
import { atom } from "jotai";

export const workspacesAtom = atomWithStorage<Workspace[]>("workspaces", []);

export const activeConnectionAtom = atomWithStorage<
  { connection: Connection; workspaceName: string } | undefined
>("activeConnection", undefined);

export const snapshotsAtom = atomWithStorage<Record<string, TLEditorSnapshot>>(
  "snapshots",
  {},
);

export const snapshotForUrlAtom = (url: string) =>
  atom((get) => get(snapshotsAtom)[url]);
