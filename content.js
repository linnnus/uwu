/////////////// REPLACEMENTS ///////////////

function init(node, fn) {
	console.debug("Starting initial run");

	// initial run
	for (const child of walkTextNodes(node))
		child.nodeValue = fn(child.nodeValue);

	// create observer
	const config = {
		characterData: true,
		characterDataOldValue: true,
		childList: true,
		subtree: true,
	};
	const observer = new MutationObserver((mutationList) => {
		observer.disconnect();

		for (const mutation of mutationList) {
			if (mutation.type == "characterData") {
				nodeWasAddedOrUpdated(mutation.target, fn);
			} else {
				for (const node of mutation.addedNodes) {
					console.debug("Mutation added node: %o", node);
					nodeWasAddedOrUpdated(node, fn);
				}
			}
		}

		observer.observe(node, config);
	});

	// TODO: should we also subscribe to characterData? it doesn't
	//       matter when subscribing to document but for other elements it might
	observer.observe(node, config);
}

function nodeWasAddedOrUpdated(node, fn) {
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

// <noscript> kinda sussy, is it still #text if it's actually used?
const ignored = ["STYLE", "CODE", "PRE", "SCRIPT", "INPUT", "TEXTAREA", "KBD", "SAMP", "VAR", "TT"];

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

	console.debug("found nodes: %o", nodeList);
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

/////////////// INIT ///////////////

init(document, s => s.toUpperCase());
