"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Normalize the math delimiters produced by PDF/DOCX extraction so remark-math
 * recognises them. MarkItDown and most LaTeX sources emit \( \) and \[ \],
 * while remark-math only understands $ and $$.
 *
 * remark-math only treats $$ as *display* math when the fences sit on their own
 * lines - a one-line `$$x$$` degrades to inline math - so every display formula
 * is rewritten into the fenced form.
 */
function normalizeMath(source: string): string {
  return source
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, body) => `\n\n$$\n${String(body).trim()}\n$$\n\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, body) => `$${String(body).trim()}$`)
    .replace(
      /(^|\n)[ \t]*\$\$[ \t]*([^\n$][^\n]*?)[ \t]*\$\$[ \t]*(?=\n|$)/g,
      (_m, lead, body) => `${lead}$$\n${String(body).trim()}\n$$`,
    );
}

/**
 * Markdown tables extracted from documents frequently lose their delimiter row
 * (`| --- | --- |`). Without it GFM renders the rows as literal pipes, so we
 * re-insert one whenever a run of pipe rows starts without it.
 */
function repairTables(source: string): string {
  const lines = source.split("\n");
  const isRow = (line: string) => /^\s{0,3}\|.*\|\s*$/.test(line);
  const isDelimiter = (line: string) => /^\s{0,3}\|[\s:|-]+\|\s*$/.test(line);

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const startsTable = isRow(line) && (i === 0 || !isRow(lines[i - 1]));

    if (startsTable) {
      // A table must be preceded by a blank line to be parsed as a block.
      if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
      out.push(line);
      if (isRow(lines[i + 1] ?? "") && !isDelimiter(lines[i + 1] ?? "")) {
        const columns = line.trim().split("|").filter(Boolean).length;
        out.push(`|${" --- |".repeat(Math.max(columns, 1))}`);
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

const components = {
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full border-collapse text-left text-[11px]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-white/5 text-text-primary">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b border-white/10 px-3 py-2 font-semibold whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b border-white/5 px-3 py-2 align-top">{children}</td>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="even:bg-white/[0.02]">{children}</tr>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-3 mb-1.5 font-display text-sm font-bold text-white">{children}</h3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-3 mb-1.5 font-display text-[13px] font-bold text-white">{children}</h4>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="mt-2.5 mb-1 font-display text-xs font-bold text-white">{children}</h5>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h6 className="mt-2 mb-1 font-display text-xs font-semibold text-white">{children}</h6>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-1.5 list-disc space-y-1 pl-5 marker:text-indigo-400">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-1.5 list-decimal space-y-1 pl-5 marker:text-indigo-400">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-2 border-l-2 border-indigo-500/50 pl-3 italic text-text-secondary">
      {children}
    </blockquote>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = Boolean(className?.startsWith("language-"));
    if (isBlock) return <code className="font-mono text-[11px]">{children}</code>;
    return (
      <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em] text-indigo-300">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-2 overflow-x-auto rounded-lg border border-white/10 bg-gray-950/70 p-3">
      {children}
    </pre>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="my-2 max-w-full rounded-lg" />
  ),
};

/** Inline variant: paragraphs collapse to spans so the markup can sit inside a heading or button. */
const inlineComponents = {
  ...components,
  p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
};

interface RichTextProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  children?: string | null;
  /** Render paragraphs as spans - use inside headings, buttons and other inline contexts. */
  inline?: boolean;
  className?: string;
}

/**
 * Renders document text as markdown with GFM tables and KaTeX-rendered mathematics.
 * Everything the user sees that originates from a source document or the AI model
 * should go through this component.
 */
export default function RichText({ children, inline = false, className = "", ...rest }: RichTextProps) {
  if (!children) return null;

  const source = normalizeMath(repairTables(children));
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={`segs-markdown ${inline ? "segs-markdown--inline" : ""} ${className}`} {...rest}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={inline ? inlineComponents : components}
      >
        {source}
      </ReactMarkdown>
    </Wrapper>
  );
}
