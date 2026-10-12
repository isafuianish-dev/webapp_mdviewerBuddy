# Markdown Syntax Guide

This file exists to show off everything the built-in parser understands.
Click between files in the sidebar to see the raw text on the left become
formatted output on the right.

## Text formatting

You can write **bold text**, *italic text*, and even ~~strikethrough text~~.
Underscores work too: __also bold__ and _also italic_, but a variable like
snake_case_name is left alone.

Inline code looks like this: `const buddy = "markdown";`

## Links

Here's a [link to the repo](https://github.com/isafuianish-dev/webapp).

## Lists

Unordered list:

- First item
- Second item
- Third item

Ordered list:

1. Preheat the oven
2. Mix the ingredients
3. Bake for 20 minutes

## Blockquotes

> Simple, readable, dependency-free.
> That's the whole point of this parser.

## Callouts

A blockquote whose first line is `[!WARNING]`, `[!ERROR]`, or `[!SUCCESS]`
renders as a tinted, icon-led callout box instead of a plain blockquote:

> [!WARNING]
> This action can't be undone once you continue.

> [!ERROR]
> The file failed to save. Check your connection and try again.

> [!SUCCESS]
> Your changes were saved.

## Code blocks

```js
function greet(name) {
  return "Hello, " + name + "!";
}
```

## Tables

| Feature      | Supported | Notes                    |
| ------------ | :-------: | ------------------------ |
| Headings     |    Yes    | `#` through `######`     |
| Tables       |    Yes    | GitHub-style, with `:` alignment |
| Nested lists |    No     | Flat lists only           |

## Horizontal rule

---

## What's intentionally left out

This is a *basic* parser, so images, footnotes, and nested lists aren't
supported — just enough Markdown to read a plain document comfortably.
