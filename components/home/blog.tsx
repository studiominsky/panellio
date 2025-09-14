import { ChevronRight, SquarePen } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import Wide from '@/containers/wide';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'posts');

function getRecentPosts() {
  const files = fs.readdirSync(POSTS_DIR);

  const posts = files.map((filename) => {
    const fileContent = fs.readFileSync(
      path.join(POSTS_DIR, filename),
      'utf-8'
    );
    const { data: frontMatter } = matter(fileContent);

    return {
      meta: frontMatter,
      slug: filename.replace('.mdx', ''),
    };
  });

  // Sort posts by date in descending order and take the first 3
  return posts
    .sort(
      (a, b) =>
        new Date(b.meta.date).getTime() -
        new Date(a.meta.date).getTime()
    )
    .slice(0, 3);
}

function Blog() {
  const recentPosts = getRecentPosts();

  return (
    <Wide>
      <div className="my-[75px] lg:my-[170px]">
        <div className="flex flex-col gap-1 items-center justify-between ">
          <Badge
            variant="outline"
            className="py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
          >
            Blog posts <SquarePen className="w-4 h-4 ml-2" />
          </Badge>
          <h2 className="text-center max-w-[680px] text-[35px] md:text-[45px] font-bold leading-tight">
            Get inspired by latest articles and resources
          </h2>
          <div className="flex flex-col justify-between mt-10 gap-5 w-full md:flex-row">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/resources/${post.slug}`}
                className="flex flex-col w-full border bg-card border-border rounded-xl cursor-pointer p-6 md:p-8 transition duration-300 hover:border-[--ui-primary] md:w-1/3"
              >
                <Badge
                  variant="outline"
                  className="py-1 w-fit border-none bg-[--ui-soft] text-black dark:text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
                >
                  {post.meta.tag}
                </Badge>
                <span className="text-2xl mt-2 font-semibold">
                  {post.meta.title}
                </span>
                <span className="mt-2 text-foreground/60">
                  {post.meta.description}
                </span>
                <span className="text-sm font-semibold flex items-center mt-5">
                  <span>Read more</span>{' '}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
          <Button
            variant="link"
            name="Log into Panellio"
            className="w-[300px] mx-auto mt-3"
          >
            <Link href="/resources">Discover more articles</Link>
          </Button>
        </div>
      </div>
    </Wide>
  );
}

export default Blog;
