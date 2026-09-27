## How it works

Type or paste Markdown and the preview updates as you type. It uses GitHub's dialect (GFM): tables with alignment, task lists with `- [ ]` and `- [x]`, code blocks with their language, strikethrough with `~~` and automatic links for bare URLs. A single line break does not split the paragraph, just like on GitHub; leave a blank line to start a new one.

The **HTML** tab shows the code the Markdown produces, ready to copy into a web page, an email or a CMS.

## Security

Markdown allows HTML inside the text, so a document can carry a `<script>` or an `onerror`. Before anything is shown, the HTML goes through DOMPurify, which removes scripts, event handlers, `javascript:` links, forms and iframes. What you copy is that sanitised HTML. Links open in a new tab and images from other servers are not loaded until you allow it.
