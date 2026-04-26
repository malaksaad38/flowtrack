"use client";

import { useSyncExternalStore } from "react";

export type EntryMode = "automatic" | "manual";

const ENTRY_MODE_KEY = "flowtrack-entry-mode";
const DEFAULT_ENTRY_MODE: EntryMode = "automatic";
const ENTRY_MODE_EVENT = "flowtrack:entry-mode-change";

function getEntryModeSnapshot(): EntryMode {
  if (typeof window === "undefined") return DEFAULT_ENTRY_MODE;

  const value = window.localStorage.getItem(ENTRY_MODE_KEY);
  return value === "manual" ? "manual" : DEFAULT_ENTRY_MODE;
}

function getServerSnapshot(): EntryMode {
  return DEFAULT_ENTRY_MODE;
}

function notifyListeners() {
  window.dispatchEvent(new Event(ENTRY_MODE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ENTRY_MODE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ENTRY_MODE_EVENT, callback);
  };
}

export function setEntryMode(mode: EntryMode) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ENTRY_MODE_KEY, mode);
  notifyListeners();
}

export function useEntryMode(): EntryMode {
  return useSyncExternalStore(subscribe, getEntryModeSnapshot, getServerSnapshot);
}
