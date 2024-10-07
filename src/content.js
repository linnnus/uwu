/*
 * Generic text replacement.
 */

// @ts-check
/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>

/**
 * Applies a text mapping over all user-visible text nodes within `node`.
 * Whenever `node` or one of its descendants is updated, the mapping will be
 * applied to the updated value as well.
 *
 * The mapping (`fn`) should be a pure function and pretty quick to compute as
 * it will be called *a lot*.
 *
 * @param {Node} node - The root node
 * @param {(s: string) => string} fn - The mapping to apply to the text
 */
function init(node, fn) {
	// Do an initial scan of the DOM, translating everything. We don't call
	// `handleNewOrUpdatedNode` as it would do a lot of unnecessary work,
	// only to arrive at this very same line.
	console.group("Initial run of the DOM");
	applyMapping(node, fn);
	console.groupEnd();

	const observerConfig = {
		characterData: true, // Modifications to the textual content of a node.
		childList: true,     // Adding/removing child nodes.
		subtree: true,       // These should be propagated to child nodes.
	};

	// Create a new `MutationObserver`. This will react to changes in the
	// DOM and update nodes appropriately.
	const observer = new MutationObserver((mutationList) => {
		console.group("Handling mutations: %o", mutationList);

		// TODO: Is this entirely sound? I haven't thought too deeply about this.
		// TODO: What is the performance impact of all this dis-/connecting?
		// We have to disconnect it here, to avoid being notified of
		// our own changes and recursing infinitely. We reconnect at
		// the end of this function.
		observer.disconnect();

		for (const mutation of mutationList) {
			if (mutation.type == "characterData") {
				const target = /** @type {CharacterData} */ (mutation.target);
				handleNewOrUpdatedNode(target, fn);
			} else {
				console.assert(mutation.type == "childList");
				for (const node of mutation.addedNodes) {
					console.debug("Mutation added node: %o", node);
					handleNewOrUpdatedNode(node, fn);
				}
			}
		}

		console.groupEnd();
		observer.observe(node, observerConfig);
	});

	observer.observe(node, observerConfig);
}

/**
 * Same as {@link applyMapping}, except it first checks whether the mapping
 * should be applied to {@link node}, i.e. whether {@link node} is itself
 * an ignored element or a descendant of one.
 *
 * @param {Node} node - The root node
 * @param {(s: string) => string} fn - The mapping to apply to the text
 */
function handleNewOrUpdatedNode(node, fn) {
	let iter = /** @type {Node | null} */ (node);
	while (iter) {
		if (isElementNode(iter) && ignored.includes(iter.tagName.toUpperCase())) {
			console.debug("Ignored: %o", node);
			return;
		}

		iter = iter.parentElement;
	}

	applyMapping(node, fn);
}

/**
 * Applies the mapping function `fn` non-recursively to `node`.
 *
 * @param {Node} node - The root node
 * @param {(s: string) => string} fn - The mapping to apply to the text
 */
function applyMapping(node, fn) {
	if (isTextNode(node)) {
		console.debug("%s => %s", node.nodeValue, fn(node.data));
		node.nodeValue = fn(node.data);
	} else if (isElementNode(node)) {
		for (const childNode of walkTextNodes(node)) {
			console.debug("%s => %s", childNode.nodeValue, fn(childNode.data));
			childNode.nodeValue = fn(childNode.data);
		}
	} else {
		console.error("Unhanded node type: ", node.nodeType);
	}
}

// This is a list of tag names that should be ignored – changing the contents
// of these would break the web in some way or another.
const ignored = [
	"STYLE",
	"CODE",
	"PRE",
	"SCRIPT",
	"INPUT",
	"TEXTAREA",
	"KBD",
	"SAMP",
	"VAR",
	"TT",
];

/**
 * Finds all text nodes within {@link node} which should be mapped.
 *
 * @param {Node} node
 * @returns {Text[]} Array of non-ignored text nodes contained within {@link node}.
 */
function walkTextNodes(node) {
	console.debug("Walking %o...", node);

	const walker = document.createTreeWalker(
		node,
		NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
		{
			 acceptNode(node) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const element = /** @type {Element} */ (node);
					return ignored.includes(element.tagName.toUpperCase())
						? NodeFilter.FILTER_REJECT
						: NodeFilter.FILTER_SKIP;
				 } else {
					 return NodeFilter.FILTER_ACCEPT;
				 }
			}
		},
	);

	// walker.currentNode starts out as the root node (not checked by acceptNode)
	// hence we skip one
	const nodeList = [];
	let currentNode = walker.nextNode();

	while(currentNode) {
		assert(isTextNode(currentNode));
		nodeList.push(currentNode);
		currentNode = walker.nextNode();
	}

	console.debug("Found nodes: %o", nodeList);
	return nodeList;
}

/**
 * Checks whether {@link node} is a text node.
 *
 * This helper function exists mainly to help the type checker
 * understand the downcasting based on {@link Node.nodeType}.
 *
 * @param {Node} node The node to check
 * @returns {node is Text} Boolean indicathing whether {@link node} is a text node
 */
function isTextNode(node) {
	return node.nodeType === Node.TEXT_NODE;
}

/**
 * Checks whether {@link node} is an element node.
 *
 * This helper function exists mainly to help the type checker
 * understand the downcasting based on {@link Node.nodeType}.
 *
 * @param {Node} node The node to check
 * @returns {node is Element} Boolean indicathing whether {@link node} is a text node
 */
function isElementNode(node) {
	return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * @param {boolean} cond
 * @returns {asserts cond}
 */
function assert(cond, message = "Assertion failed") {
	if (!cond) {
		throw new Error(message);
	}
}

/*
 * Uwuification
 */

/** @type {[RegExp, string | ((match: string, ...captures: string[]) => string)][]} */
const replacements = [
	[/(?:r|l)/gi,         "w"],
	[/n([aeiou ])(?!\b)/g, "ny$1"],
	[/\byou'we\b/gi,      "ur"],
	[/\byouwe\b/gi,       "ur"],
	[/\bfuck\b/gi,        "fwickk"],
	[/\bshit\b/gi,        "poopoo"],
	[/\bbitch\b/gi,       "meanie"],
	[/\basshole\b/gi,     "b-butthole"],
	[/\bdick|penyis\b/gi, "peenie"],
	[/\bcum\b/gi,         "cummies"],
	[/\bsemen\b/gi,       "cummies"],
	[/\bass\b/gi,         "boi pussy"],
	[/\bdad\b/gi,         "daddy"],
	[/\bfather\b/gi,      "daddy"],
	[/\bmom\b/gi,         "mommy"],
	[/\bmother\b/gi,      "mommy"],
	[/ove\b/g,            "uv"],
	[/(?<=\w)!+/giv,   () => random(faces.joy)],
	[/(?<=\w)\?+/giv,  () => random(faces.confused)],
	[/(?<=\w),+/giv,   () => random(faces.embarassed)],
	[/(?<=\w)\.+/giv,  () => random(faces.sparkles)],
	[/\b(\w)/giv,     (_, m) => (Math.random() < 0.05 ? `${m}-${m}` : m)],
];

const faces = {
	sparkles:   [ " (・`ω´・)", " owo", " UwU", " >w<", " ^w^", "☆*:・ﾟ", "〜☆ ", " uguu.., ", " -.-"   ],
	joy:        [ "!!!", " (* ^ ω ^)", " (o^▽^o)", " (≧◡≦)", ' ☆⌒ヽ(*"､^*)chu', " ( ˘⌣˘)♡(˘⌣˘ )", " xD" ],
	embarassed: [ " (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..", " (*^.^*)..,", "..,", ",,,", "... ", ".. ", " mmm..", " O.o",   ],
	confused:   [" (o_O)?", " (°ロ°) !?", " (ーー;)?", " owo?", " ;;w;;"                                ],
};

/**
 * Select a random element from an array.
 *
 * @template T
 * @param {T[]} arr The array to choose from.
 * @returns {T} A random element.
 */
function random(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Transform text to be uwu-speak.
 *
 * @param {string} text The normal text
 * @returns {string} Uwuified text
 */
function uwuify(text) {
	text = text.toLowerCase();

	for (const [from, to] of replacements) {
		// @ts-ignore TypeScript can't match union types against overloads properly.
		// See: https://github.com/microsoft/TypeScript/issues/32164
		text = text.replace(from, to);
	}

	return text;
}

/*
 * Entry point
 */

// When run under puppeteer during testing, it is much simpler to just test
// if a string is upper case, than whether it has been uwuified, since
// uwuification is non-deterministic.
const mapping = navigator.webdriver
	? /** @type{(s: string) => string} */ (s => s.toUpperCase())
	: uwuify;

// Ignore sites with "lang" explicitly set to something other than EN. Most
// sites don't set it, which is bad, but whatever lets just assume they're in
// English.
const { lang } = document.documentElement;
if (lang?.startsWith("en") || !lang) {
	init(document.documentElement, mapping);
}
