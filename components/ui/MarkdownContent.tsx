import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-full min-w-0 [overflow-wrap:anywhere] text-base leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-2 break-words text-3xl font-bold leading-tight sm:text-4xl">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 break-words border-b border-current/20 pb-2 text-2xl font-bold">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 break-words text-xl font-semibold">
              {children}
            </h3>
          ),

          p: ({ children }) => <p className="mb-4 break-words">{children}</p>,

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-2 break-words sm:ml-6">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-2 break-words sm:ml-6">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="break-words">{children}</li>,

          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),

          pre: ({ children }) => (
            <pre className="my-6 max-w-full overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm leading-6 text-white sm:p-5">
              {children}
            </pre>
          ),

          code: ({ children, className }) => {
            const isCodeBlock = className?.includes("language-");

            if (isCodeBlock) {
              return <code className={className}>{children}</code>;
            }

            return (
              <code className="break-words rounded bg-zinc-200 px-1.5 py-0.5 text-sm text-zinc-900">
                {children}
              </code>
            );
          },

          blockquote: ({ children }) => (
            <blockquote className="my-6 break-words border-l-4 border-current/30 pl-4 italic">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="my-6 max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border border-current/20 px-3 py-2 font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-current/20 px-3 py-2 align-top">
              {children}
            </td>
          ),

          hr: () => <hr className="my-8 border-current/20" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
