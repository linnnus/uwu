# uwu-web

This extension uwuifies the web. It's way harder than it seems.

## TODO

* Edit user-visible attributes like `placeholder="..."` and `label`
* Fix github (need to match on class)
* Fix post titles on Reddit. The first few titles are loaded in a weird way.
  They are initally translated but then they're set back again. This is
  probably the reactive framework hydrating the DOM.
* Remove CSS properties that modify the appearence of text content (e.g. `text-transform`)?
* actual testing. for example:

  * Inserting a normal node
  * Modifying a normal node
  * Inserting a `<code>` (or some other ignored element)
  * Appending a child to a `<code>`
  * Inserting a text node under a `<code>`
  * Modifying a childnode of a `<code>`

  This will probably require jsdom or something.
