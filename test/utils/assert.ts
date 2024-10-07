import { AssertionError } from "jsr:@std/assert";

export function assertUpperCase(actual: string, msg?: string) {
  if (actual !== actual.toUpperCase()) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected actual: ${JSON.stringify(actual)} to be uppercase${msgSuffix}`;
    throw new AssertionError(msg);
  }
}

export function assertStringIncludes(haystack: string, needle: string, msg?: string) {
  if (!haystack.includes(needle)) {
    const msgSuffix = msg ? `: ${msg}` : ".";
    msg = `Expected string ${JSON.stringify(haystack)} to include ${JSON.stringify(needle)}${msgSuffix}`;
    throw new AssertionError(msg);
  }
}
