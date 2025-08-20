// components/custom-server-mdx.tsx
'use server';

import { MDXRemote, MDXRemoteProps } from 'remote-mdx/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export async function RenderMarkdown({ source }: { source: string }) {
  try {
    const rendered = await MDXRemote({
      source,
      options: {
        mdxOptions: {
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            [rehypePrettyCode, { theme: 'material-theme' }] as any,
          ],
        },
      },
    });

    return rendered;
  } catch (error) {
    console.error('Error rendering Markdown:', error);
    return '<p>Error rendering content.</p>';
  }
}
