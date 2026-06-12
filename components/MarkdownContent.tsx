import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

/**
 * Rendu Markdown (articles d'actualités). Pas de rehype-raw : le HTML brut
 * éventuellement saisi par un admin n'est jamais interprété, seulement
 * affiché comme texte. remark-gfm ajoute tables, listes de tâches,
 * barré, etc.
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="flex flex-col gap-4 text-neutral-700 leading-relaxed [&>*:first-child]:mt-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2
              className="text-2xl sm:text-3xl font-bold text-primary-800 heading-serif mt-6 mb-2"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2
              className="text-xl sm:text-2xl font-bold text-primary-800 heading-serif mt-6 mb-2"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-800 mt-4 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p>{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary-700 underline hover:text-primary-800"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 flex flex-col gap-1">{children}</ul>,
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 flex flex-col gap-1">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent-400 pl-4 italic text-neutral-600">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
          hr: () => <hr className="border-neutral-200" />,
          code: ({ children }) => (
            <code className="bg-neutral-100 text-neutral-800 rounded px-1.5 py-0.5 text-sm">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-neutral-100 text-neutral-800 rounded-lg p-4 overflow-x-auto text-sm">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-neutral-50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 border border-neutral-200 font-semibold text-neutral-700">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-3 py-2 border border-neutral-200">{children}</td>,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ""} className="rounded-lg max-w-full" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
