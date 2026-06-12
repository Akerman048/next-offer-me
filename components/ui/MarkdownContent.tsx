import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none text-base leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-2 text-4xl font-bold leading-tight">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 border-b border-current/20 pb-2 text-2xl font-bold">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 text-xl font-semibold">{children}</h3>
          ),

          p: ({ children }) => <p className="mb-4">{children}</p>,

          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),

          li: ({ children }) => <li>{children}</li>,

          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),

          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-2xl bg-zinc-950 p-5 text-sm leading-6 text-white">
              {children}
            </pre>
          ),

          code: ({ children, className }) => {
            const isCodeBlock = className?.includes("language-");

            if (isCodeBlock) {
              return <code className={className}>{children}</code>;
            }

            return (
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm text-zinc-900">
                {children}
              </code>
            );
          },

          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-current/30 pl-4 italic">
              {children}
            </blockquote>
          ),

          hr: () => <hr className="my-8 border-current/20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}