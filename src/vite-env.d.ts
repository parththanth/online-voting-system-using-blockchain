
/// <reference types="vite/client" />

// Extend the Window interface to include ethereum property for MetaMask/wallet extensions
declare global {
  interface Window {
    ethereum?: {
      providers?: unknown[];
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    } & Record<string, unknown>;
  }
}

// This export statement makes TypeScript treat this as a module
export {};
