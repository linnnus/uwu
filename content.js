/*** General {{{1 ***/

// TODO: this breaks custom text areas like monaco. Could implement some custom
//       rules to ignore it (maybe certain classes), but it wouldn't be general
//       enough

const ignoredElts = ["STYLE", "PRE", "SCRIPT", "CODE", "INPUT", "TEXTAREA"];

// walk nodes
function* walkContentTextNodes(node) {
	const walker = document.createTreeWalker(
		node,
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		{
			acceptNode(node) {
				// ignore these nodes and do not recurse into subtree
				if (node.tagName && ignoredElts.includes(node.tagName))
					return NodeFilter.FILTER_REJECT;

				// do not emit element nodes, but recurse into subtree
				if (node.nodeType === Node.ELEMENT_NODE)
					return NodeFilter.FILTER_SKIP;

				return NodeFilter.FILTER_ACCEPT;
			},
		}
	);

	while (walker.nextNode())
		yield walker.currentNode;
}

function getParents(node) {
	let parents = [];

	while (node.parentNode) {
		parents.push(node.parentNode);
		node = node.parentNode;
	}

	return parents;
}

// apply fn() to every text node under rootNode
function init(rootNode, fn) {
	// set up observer for subsequent changes
	const observer = new MutationObserver((mutationList) => {
		for (const mutation of mutationList)
			// we need to check all parents to make sure the text node
			// isn't part of an ignored element
			for (const node of mutation.addedNodes) {
				if (!mutation.addedNodes) continue;

				if (
					node.nodeType === Node.TEXT_NODE &&
					!getParents(node).filter(ignoredElts.includes(node))
				) {
					node.nodeValue = fn(node.nodeValue);
				} else {
					// for other nodes we must iterate their entire
					// subtree, since it might've been built "outside"
					// of the dom before being appended.
					for (const child of walkContentTextNodes(node)) {
						child.nodeValue = fn(child.nodeValue);
					}
				}
			}
	});
	observer.observe(rootNode, { childList: true, subtree: true });

	// initial run of document
	for (const node of walkContentTextNodes(rootNode)) {
		node.nodeValue = fn(node.nodeValue);
	}
}

/*** Uwu stuff {{{1 ***/

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
	[/ove\b/g,            "uv"],
	[/(?<=\p{L})\!+/gi, () => random(faces.joy)],
	[/(?<=\p{L})\?+/gi, () => random(faces.confused)],
	[/(?<=\p{L})\,+/gi, () => random(faces.embarassed)],
	[/(?<=\p{L})\.+/gi, () => random(faces.sparkles)],
	[/\b(\w)/gi, (_, m) => (Math.random() < 0.05 ? `${m}-${m}` : m)],
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

// ignore sites with "lang" explicitly set to something other than EN
// most sites don't set it, which is bad, but whatever
if (
	document.documentElement.lang?.startsWith("en") ||
	!document.documentElement.lang
) {
	init(document, uwuify);
}

// vim: ft=javascript noet tw=80 fdm=marker
