import { atom } from "jotai";

export const schemaAtom = atom<{
  tables: Record<string, string[]>;
  references: Record<string, string[]>;
}>({
  tables: {},
  references: {},
});

export const providerRegistrationAtom = atom(false);
