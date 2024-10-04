// deno-lint-ignore-file no-explicit-any

/// <reference lib="dom" />

import type { Page } from "jsr:@astral/astral";

/**
 * Create a promise which resolves after the DOM has "settled", i.e. there are not more modifications
 * happening. If the DOM is idle for more than `debounceMs`, it is considered settled.
 *
 * @param debounceMs The maximum time between DOM modifications.
 * @param timeoutMs The maximum time to wait for the DOM to settle.
 * @returns A promise that resolves when the DOm settles, or rejects after `timeoutMs` has passed.
 */
export function waitForDomToSettle(page: Page, debounceMs = 1000, timeoutMs = 30_000) {
	function inner(timeoutMs: number, debounceMs: number) {
		function debounce<P extends ((...args: any[]) => void)>(func: P, ms: number) {
			let timeout: ReturnType<typeof setTimeout>;

			return (...args: Parameters<P>) => {
console.info("Debounced!!");
				clearTimeout(timeout);
				timeout = setTimeout(() => {
					func(...args);
				}, ms);
			};
		};

		return new Promise<void>((resolve, reject) => {
			const mainTimeout = setTimeout(() => {
				observer.disconnect();
				reject(new Error("Timed out while waiting for DOM to settle"));
			}, timeoutMs);

			const debouncedResolve = debounce(async () => {
				observer.disconnect();
				clearTimeout(mainTimeout);
				resolve();
			}, debounceMs);

			const observer = new MutationObserver(debouncedResolve);
			const config = {
				attributes: true,
				childList: true,
				subtree: true,
			};
			observer.observe(document.body, config);
			debouncedResolve(); // Kickstart in case of no DOM modifications.
		});
	}

	return page.evaluate(inner, { args: [timeoutMs, debounceMs] });
}
