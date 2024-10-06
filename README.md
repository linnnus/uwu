# uwu-web

This extension uwuifies the web. It's way harder than it seems.

## Testing

Integration tests are found in `tests/`. They are written using [Deno]'s
bult-in test framework and [Astral] for remote browser control. You can run
this command to run all unit tests.

```sh
$ cd tests/
$ deno task dev
```

The testing is the only part of this project that specifically relies on Deno.

[Deno]: https://deno.land/
[Astral]: https://jsr.io/@astral/astral

## Building

A bundled extension can be built using [`web-ext`] from Mozilla.
`web-ext` can also be used to run interactive debugging sessions.
See [their documentation][web-ext-run] for more info.

[`web-ext`]: https://github.com/mozilla/web-ext
[web-ext-run]: https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run

## TODO

* Edit user-visible attributes like `placeholder="..."` and `label`
* Fix github (need to match on class)
* Remove CSS properties that modify the appearence of text content (e.g. `text-transform`)?
* Check `[lang]` on sub-elements as well, not just the root element. For example, an English page could contain a quote in French.
