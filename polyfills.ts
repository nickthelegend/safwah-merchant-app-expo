// Web3 polyfills for React Native. Must be imported before any wallet / wagmi code.
// Ported from molfi-expo-app so the Reown AppKit + wagmi stack has the Node-style
// globals (Buffer, process, atob/btoa) that crypto libraries expect.
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Only polyfill what is strictly necessary for Node-compatible libs
const globalObj = typeof globalThis !== 'undefined' ? globalThis : global;

(globalObj as any).Buffer = (globalObj as any).Buffer || Buffer;
(globalObj as any).process = (globalObj as any).process || {};
(globalObj as any).process.env = (globalObj as any).process.env || {};
(globalObj as any).process.nextTick =
  (globalObj as any).process.nextTick ||
  ((fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0));

// Base64 for crypto libs
(globalObj as any).atob =
  (globalObj as any).atob || ((str: string) => Buffer.from(str, 'base64').toString('binary'));
(globalObj as any).btoa =
  (globalObj as any).btoa || ((str: string) => Buffer.from(str, 'binary').toString('base64'));

console.log('[Polyfills] Safwah merchant web3 suite initialized');
