"use client";

import React from "react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function simpleMarkdownToHtml(input: string): string {
  let text = input.replace(/\r\n/g, "\n");
  // Code blocks ```
  text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="rounded-md bg-muted p-3 overflow-auto"><code>${escapeHtml(code)}</code></pre>`;
  });
  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, (_, code) => `<code class="rounded bg-muted px-1">${escapeHtml(code)}</code>`);
  // Bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>');
  // Newlines to <br/>
  text = text.replace(/\n/g, "<br/>");
  return text;
}

export default function Markdown({ children }: { children: string }) {
  const html = React.useMemo(() => simpleMarkdownToHtml(children || ""), [children]);
  // eslint-disable-next-line react/no-danger
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}


