import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const schemaAtom = atom<{
  tables: Record<string, string[]>;
  references: Record<string, string[]>;
}>({
  tables: {},
  references: {},
});

export const providerRegistrationAtom = atom(false);

export const persistanceAtom = atomWithStorage<string>(
  "persistance",
  "default",
);
