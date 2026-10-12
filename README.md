# MD Viewer Buddy

A clean, distraction-free reader for browsing a library of Markdown documents entirely in your browser.

MD Viewer Buddy is built for reading, not editing: it presents a searchable list of Markdown documents in a sidebar and renders whichever one you select as a nicely formatted page — headings, tables, code blocks, callouts, and all. It comes preloaded with a handy set of quick-reference cheat sheets (Git, JavaScript, TypeScript, Node.js, Python, Perl, ksh, WebSocket, and Markdown itself), so it doubles as a searchable reference library out of the box. There's nothing to install, no account, and nothing you view is ever uploaded anywhere.

## Features

- **Searchable document list** — a sidebar lists every available document; type in the search box at the top to instantly filter the list by title or filename.
- **Clean rendered view** — the selected document is rendered as formatted text with proper heading sizes, styled tables, bordered code blocks, colored callout boxes, and more (see "Supported Markdown" below).
- **Document header info** — above every open document you'll see its title and a small meta line showing the filename and a live word count.
- **Table of contents** — for any document with two or more headings, a table-of-contents icon appears in the header. Hover or click it to reveal a popover with a nested outline of every heading in the document; click any line to jump straight to that section.
- **Reading-position highlighting** — as you scroll through a document, the table of contents automatically highlights the section you're currently reading.
- **Font picker** — step through five different reading fonts (System UI, Arial, Georgia, Verdana, Courier New) using the arrows next to the font name in the document header.
- **Zoom control** — enlarge or shrink the rendered document from 80% up to 200% in 10% steps, independent of your browser's own zoom.
- **Raw markdown view** — toggle the "view raw markdown" button to see the exact, unrendered Markdown source in a monospaced block instead of the formatted view — useful for copying the original text or checking formatting.
- **Copy-to-clipboard on code blocks** — hover over any code block (including the raw markdown view itself) to reveal a copy button; clicking it copies the code's text and briefly shows a checkmark to confirm.
- **Scrollable wide tables** — tables that are too wide for the window get their own horizontal scrollbar instead of squeezing the whole page or breaking the layout.
- **In-page anchor links** — links within a document that point to a heading (e.g. a table-of-contents style link inside the text) smoothly scroll you to that heading rather than navigating away.
- **Remembers where you left off** — the last document you had open is remembered and reopened automatically the next time you visit.
- **Light and dark themes with accent colors** — available from the Settings panel (see Customization below).
- **Responsive layout** — on narrower windows or phone-sized screens, the document list moves above the reading pane instead of sitting beside it.

## Supported Markdown

The renderer supports a focused, GitHub-flavored subset of Markdown. Here's exactly what renders, and what doesn't:

**Supported:**
- **Headings** — `#` through `######` (H1–H6), each with its own clickable anchor for jump links and the table of contents. If a document starts with a top-level `#` heading, that heading's text is used as the document's title in the sidebar and header.
- **Bold** — `**text**` or `__text__`
- **Italic** — `*text*` or `_text_`
- **Strikethrough** — `~~text~~`
- **Inline code** — `` `code` ``
- **Fenced code blocks** — ```` ```lang ```` blocks, shown in a bordered, monospaced box (with the copy button described above)
- **Links** — `[label](url)`, but only `http://`, `https://`, and `mailto:` addresses are turned into clickable links (for safety, other link schemes are shown as plain text); external links open in a new tab automatically
- **Blockquotes** — lines starting with `>`, including quotes nested inside other blocks
- **GitHub-style callout alerts** — a blockquote whose first line is `[!WARNING]`, `[!ERROR]`, or `[!SUCCESS]` is rendered as a colored, icon-labeled callout box instead of a plain quote
- **Unordered lists** — lines starting with `-`, `*`, or `+`
- **Ordered lists** — lines starting with `1.`, `2.`, etc.
- **Horizontal rules** — a line of three or more `-`, `*`, or `_` characters
- **Tables** — standard pipe-delimited tables with a header row and separator row, including left/right/center column alignment (`:---`, `---:`, `:---:`)
- **Line breaks inside a paragraph** — end a line with two trailing spaces to force a line break without starting a new paragraph

**Not supported** (these will show up as plain or literal text rather than being rendered specially):
- Images — `![alt](url)` is not turned into an embedded picture
- Footnotes
- Nested/multi-level lists — list items are rendered as a single flat level
- Task/checkbox list items (`- [ ]`)
- Raw HTML embedded in the Markdown (it's shown escaped, as text, rather than executed)
- Syntax-highlighted code (the language after ` ``` ` is recorded but code text isn't colorized by token type)

## How to Use

1. **Browse the document list** on the left. Each entry shows the document's title (its first heading, or a cleaned-up version of the filename if it has none).
2. **Search for a document** by typing into the search box above the list — it filters by both title and filename as you type.
3. **Click a document** to open it in the main pane. Its title, filename, and word count appear in the header, and the content renders below.
4. **Navigate long documents with the table of contents** — if the icon appears in the header, hover or click it to see the full heading outline and jump to any section instantly.
5. **Adjust how the text looks** using the font arrows and zoom buttons in the document header — your choices are remembered for next time.
6. **Switch to raw view** with the raw-markdown toggle button if you want to see or copy the unformatted source text.
7. **Copy a code snippet** by hovering over any code block and clicking the copy icon that appears in its top-right corner.
8. **Open Settings** via the gear icon in the top-right corner to change the theme or accent color.

## Customization

Open the **gear icon** in the top-right corner to access Settings:

- **Theme** — switch between a light and a dark color scheme using the sun/moon toggle.
- **Accent color** — choose from six swatches (Indigo, Blue, Green, Rose, Amber, Purple) to personalize highlights like the active file, active table-of-contents entry, and focus states.

Reading preferences are adjusted directly from the document header rather than the Settings panel:

- **Font** — cycle through System UI, Arial, Georgia, Verdana, and Courier New using the arrows beside the font name.
- **Zoom** — scale the rendered document from 80% to 200% using the zoom buttons.

Every preference — theme, accent, font, zoom, and your last-opened document — is saved automatically in your browser and restored the next time you open the app.

## Tips & Shortcuts

- **Nothing is uploaded anywhere.** Documents are read and rendered entirely in your browser, and your reading preferences (theme, accent, font, zoom, last-opened file) are stored locally in your browser's storage — never sent to a server.
- **This is a viewer, not an editor.** There's no way to create, edit, upload, or delete documents from within the app — it's meant purely for comfortably reading a fixed set of Markdown files.
- **The word count in the header** is a quick way to gauge how long a document is before you start reading.
- **If a table of contents icon doesn't appear**, the document simply doesn't have enough headings (fewer than two) to warrant one.
- **Use the raw view to double-check formatting** — if something in the rendered view looks off, flipping to raw markdown shows you exactly what's in the source file, including any syntax the renderer doesn't support.
- **The copy button also works in raw view** — it's an easy way to grab an entire document's original Markdown text in one click.
- **Only safe links are clickable** — web addresses and email links work as expected, but links using other URL schemes are intentionally left as plain, non-clickable text.
