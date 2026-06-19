import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Safe markdown renderer with GitHub Flavored Markdown support.
 * Styles output with prose-like Tailwind classes — no @tailwindcss/typography needed.
 *
 * @param {{ children: string, className?: string }} props
 */
export function MarkdownContent({ children, className = '' }) {
  if (!children || !children.trim()) {
    return <p className="text-sm text-muted-foreground italic">No content</p>
  }

  return (
    <div
      className={`text-sm text-foreground leading-relaxed space-y-2
        [&_p]:min-h-[1em]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
        [&_li]:pl-0.5
        [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
        [&_strong]:font-bold [&_strong]:text-foreground
        [&_em]:italic
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
        [&_hr]:border-border
        [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-xs
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_h1]:text-base [&_h1]:font-bold
        [&_h2]:text-sm [&_h2]:font-bold
        [&_h3]:text-sm [&_h3]:font-semibold
        [&_del]:line-through [&_del]:text-muted-foreground
        [&_table]:w-full [&_table]:text-xs
        [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_th]:font-semibold
        [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5
        ${className}`}
    >
      <Markdown remarkPlugins={[remarkGfm]}>
        {children}
      </Markdown>
    </div>
  )
}
