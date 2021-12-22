/////////////// REPLACEMENTS ///////////////


function init(node, fn) {
	// initial run
	for (const child of walkTextNodes(node))
		child.nodeValue = fn(child.nodeValue);

	// create observer
	const observer = new MutationObserver((mutationList) => {
		for (const mutation of mutationList) {
			if (!mutation.addedNodes)
				continue;

			for (const node of mutation.addedNodes) {
				if (hasIgnoredParentsOrShouldBeIgnored(node))
					continue;

				if (node.nodeType === Node.TEXT_NODE)
					node.nodeValue === fn(node.nodeValue);
				else
					for (const childNode of walkTextNodes(node))
						childNode.nodeValue = fn(childNode.nodeValue);
			}
		}
	});

	// NOTE: should we also subscribe to characterData? it doesn't
	//       matter for document but for other elements it might
	observer.observe(node, { childList: true, subtree: true });
}

// <noscript> kinda sussy, is it still #text if it's actually used
const ignored = ["STYLE", "CODE", "PRE", "SCRIPT", "INPUT", "TEXTARE"];

function walkTextNodes(node) {
	console.log("walking", node);

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

	// walker.nextNode() skips the first child (as opposed to initializing with
	// walker.currentNode. this is on purpose as walkTextNodes will be called with document,
	// which doesn't satisfy accepNode(). therefore, we must skip it since it will be null
	const nodeList = [];
	let currentNode = walker.nextNode();

	while(currentNode) {
		nodeList.push(currentNode);
		currentNode = walker.nextNode();
	}

	return nodeList;
}

function hasIgnoredParentsOrShouldBeIgnored(node) {
	while (node) {
		if (ignored.includes(node.tagName.toUpperCase()))
			return true;

		node = node.parentNode;
	}

	return false;
}

/////////////// UWU ///////////////

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

/////////////// INIT ///////////////

// ignore sites with "lang" explicitly set to something other than EN
// most sites don't set it, which is bad, but whatever
const { lang } = document.documentElement;
if (lang?.startsWith("en") || !lang)
	init(document, uwuify);
