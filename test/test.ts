import { launch, type Page } from "jsr:@astral/astral"; //=;
import { serveDir } from "jsr:@std/http/file-server";
import { waitForDomToSettle } from "./utils/dom.ts";
import { assertEquals, assertExists } from "jsr:@std/assert";
import { assertUpperCase, assertStringIncludes } from "./utils/assert.ts";

const EXTENSION_PATH = new URL("../src", import.meta.url).pathname;

function test(fixture: string, check: (page: Page) => Promise<void> | void) {
	Deno.test({
		name: `Check ${fixture}`,

		// Astral's internal logic has a "leak" unrelated to our tests.
		sanitizeResources: false,
		sanitizeOps: false,

		async fn() {
			// FIXME: There's no reason to start a browser instance per test, except that I can't figure out how to do global setup/teardown with Deno's testing framework.
			const browser = await launch({
				headless: false,
				args: [
					`--disable-extensions-except=${EXTENSION_PATH}`,
					`--load-extension=${EXTENSION_PATH}`
				],
			});

			const server = Deno.serve(
				{
					// Supress "listening on http://..." message.
					onListen: () => void 0,
				},
				req => serveDir(req, {
					fsRoot: "./fixtures",
					quiet: true, // Supress request logging.
				})
			);

			// Navigate to the test.
			const page = await browser.newPage();
			await page.goto(`http://${server.addr.hostname}:${server.addr.port}/${fixture}`);

			try {
				await check(page);
			} /*catch (e) {
				console.error(e);
				throw e;
			} */finally {
				await browser.close();
				await server.shutdown();
			}
		},
	});
}

async function getTextContent(page: Page, query: string): Promise<string> {
	const handle = await page.$(query);
	assertExists(handle);
	const textContent = await handle.evaluate((el: HTMLElement) => el.textContent);
	assertExists(textContent);
	return textContent;
}

test("0001-static.html", async (page) => {
	const textContent = await getTextContent(page, "#test-target");
	assertUpperCase(textContent);
});

test("0002-adding-node.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertUpperCase(textContent);
	assertStringIncludes(textContent, "SOME STRING", "Dynamic content is missing");
});

test("0003-modifying-text-node.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertUpperCase(textContent);
	assertStringIncludes(textContent, "DYNAMICALLY UPDATED", "Dynamic update was not run");
});

test("0004-static-ignored-tag.html", async (page) => {
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "THIS SHOULD BE UPPERCASED, BUT this should not be.");
});

test("0005-inserting-ignored-tag.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "This should not be modified");
});

test("0006-modifying-ignored-tag.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "THIS SHOULD BE UPPERCASED, BUT this should not be even though it's dynamically updated.");
});

test("0007-appending-child-to-ignored-tag.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "THIS SHOULD BE UPPERCASED, BUT this should not be and neither should this child node.");
});

test("0008-appending-text-node-to-ignored-tag.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "THIS SHOULD BE UPPERCASED, BUT this should not be and neither should this text node.");
});

test("0009-modifying-child-of-ignored-tag.html", async (page) => {
	await waitForDomToSettle(page, 1000);
	const textContent = await getTextContent(page, "#test-target");
	assertEquals(textContent, "THIS SHOULD BE UPPERCASED, BUT this should not be even though it's dynamically updated.");
});

// TODO:
//  Modifying a childnode of a `<code>`
