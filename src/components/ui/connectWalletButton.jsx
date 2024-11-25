"use client";
import React from "react";
import { setAllowed } from "@stellar/freighter-api";

export function ConnectButton({ label }) {
  return (
    <button
      className={`" w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm"`}
      onClick={setAllowed}
    >
      {label}
    </button>
  );
}
