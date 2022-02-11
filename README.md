# uwu-web

This extension uwuifies the web. It's way harder than it seems.

## TODO
* Edit user-visible attributes like `placeholder="..."`
* Fix github (need to match on class)
* Fix soundcloud `<title>`. It is updated when a new song is played, and then
  it is not updated., Når titlen opdateres bemærker vi det slet ikke????
* Fix reddit stylesheets
* actual testing. for example:
	* Inserting a normal node
	* Modifying a normal node
	* Inserting a `<code>` (or some other ignored element)
	* Appending a child to a `<code>`
	* Inserting a text node under a `<code>`
	* Modifying a childnode of a `<code>`
  This will probably require jsdom or something.
