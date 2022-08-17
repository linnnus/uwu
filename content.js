/////////////// REPLACEMENTS ///////////////

function init(node, fn) {
	console.debug("Starting initial run");

	// initial run
	for (const child of walkTextNodes(node))
		child.nodeValue = fn(child.nodeValue);

	// create observer
	const observer = new MutationObserver((mutationList) => {
		for (const mutation of mutationList) {
			if (!mutation.addedNodes)
				continue;

			for (const node of mutation.addedNodes) {
				if (hasIgnoredParentsOrShouldBeIgnored(node)) {
					console.debug("has ignored parent: %o", node);
					continue;
				}

				if (node.nodeType === Node.TEXT_NODE)
					node.nodeValue === fn(node.nodeValue);
				else
					for (const childNode of walkTextNodes(node))
						childNode.nodeValue = fn(childNode.nodeValue);
			}
		}
	});

	// TODO: should we also subscribe to characterData? it doesn't
	//       matter when subscribing to document but for other elements it might
	observer.observe(node, { childList: true, subtree: true });
}

// <noscript> kinda sussy, is it still #text if it's actually used?
const ignored = ["STYLE", "CODE", "PRE", "SCRIPT", "INPUT", "TEXTAREA"];

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
