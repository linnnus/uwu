/*
 * Generic text replacement.
 */

function init(node, fn) {
	// Do an initial scan of the DOM, translating everything. We don't call
	// `handleNewOrUpdatedNode` as it would do a lot of unnecessary work,
	// only to arrive at this very same line.
	console.group("Initial run of the DOM");
	for (const child of walkTextNodes(node)) {
		console.assert(child.nodeType === Node.TEXT_NODE, "Expected text node, got %o", child);
		child.nodeValue = fn(child.nodeValue);
	}
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
				handleNewOrUpdatedNode(mutation.target, fn);
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

function handleNewOrUpdatedNode(node, fn) {
	if (hasIgnoredParentsOrShouldBeIgnored(node)) {
		console.debug("Ignored: %o", node);
		return;
	}

	if (node.nodeType === Node.TEXT_NODE) {
		console.debug("%s => %s", node.nodeValue, fn(node.nodeValue));
		node.nodeValue = fn(node.nodeValue);
	} else {
		for (const childNode of walkTextNodes(node)) {
			console.debug("%s => %s", childNode.nodeValue, fn(childNode.nodeValue));
			childNode.nodeValue = fn(childNode.nodeValue);
		}
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

function walkTextNodes(node) {
	console.debug("Walking %o...", node);

	const walker = document.createTreeWalker(
		node,
		NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
		{
			 acceptNode(node) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					return ignored.includes(node.tagName.toUpperCase())
						? NodeFilter.FILTER_REJECT
						: NodeFilter.FILTER_SKIP;
				 } else {
					 return NodeFilter.FILTER_ACCEPT;
				 }
			}
		},
		false,
	);

	// walker.currentNode starts out as the root node (not checked by acceptNode)
	// hence we skip one
	const nodeList = [];
	let currentNode = walker.nextNode();

	while(currentNode) {
		nodeList.push(currentNode);
		currentNode = walker.nextNode();
	}

	console.debug("Found nodes: %o", nodeList);
	return nodeList;
}

function hasIgnoredParentsOrShouldBeIgnored(node) {
	while (node) {
		if (node.tagName && ignored.includes(node.tagName.toUpperCase()))
			return true;

		node = node.parentNode;
	}

	return false;
}

/*
 * Uwuification
 */

const replacements = [
	[/(?:r|l)/gi,         "w"],
	[/n([aeiou ])/g,      "ny$1"],
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
	[/(?<=\p{w})\!+/gi, () => random(faces.joy)],
	[/(?<=\p{w})\?+/gi, () => random(faces.confused)],
	[/(?<=\p{w})\,+/gi, () => random(faces.embarassed)],
	[/(?<=\p{w})\.+/gi, () => random(faces.sparkles)],
	[/\b(\p{w})/gi, (_, m) => (Math.random() < 0.05 ? `${m}-${m}` : m)],
];

const faces = {
	sparkles:   [ " (・`ω´・)", " owo", " UwU", " >w<", " ^w^", "☆*:・ﾟ", "〜☆ ", " uguu.., ", " -.-"   ],
	joy:        [ "!!!", " (* ^ ω ^)", " (o^▽^o)", " (≧◡≦)", ' ☆⌒ヽ(*"､^*)chu', " ( ˘⌣˘)♡(˘⌣˘ )", " xD" ],
	embarassed: [ " (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..", " (*^.^*)..,", "..,", ",,,", "... ", ".. ", " mmm..", " O.o",   ],
	confused:   [" (o_O)?", " (°ロ°) !?", " (ーー;)?", " owo?", " ;;w;;"                                ],
};

function random(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function uwuify(text) {
	text = text.toLowerCase();

	for (const [from, to] of replacements)
		text = text.replace(from, to);

	return text;
}

/*
 * Entry point
 */

// When run under puppeteer during testing, it is much simpler to just test
// if a string is upper case, than whether it has been uwuified, since
// uwuification is non-deterministic.
const mapping = navigator.webdriver ? (s => s.toUpperCase()) : uwuify;

// Ignore sites with "lang" explicitly set to something other than EN. Most
// sites don't set it, which is bad, but whatever lets just assume they're in
// English.
const { lang } = document.documentElement;
if (lang?.startsWith("en") || !lang) {
	init(document, mapping);
}
