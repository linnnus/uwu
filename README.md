# uwu-web

This extension uwuifies the web. It's way harder than it seems.

## TODO
* Edit user-visible attributes like `placeholder="..."`
* Fix github (need to match on class)
* actual testing. for example:
	* Inserting a normal node
	* Modifying a normal node
	* Inserting a `<code>` (or some other ignored element)
	* Appending a child to a `<code>`
	* Inserting a text node under a `<code>`
	* Modifying a childnode of a `<code>`
  This will probably require jsdom or something.
