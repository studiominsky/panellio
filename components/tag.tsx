'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TagProps } from '../types/blog-type';
import { Badge } from './ui/badge';
import { ChevronRight } from 'lucide-react';

const Tag: React.FC<TagProps> = ({ tags, posts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag') || 'All';

  const filteredPosts =
    selectedTag === 'All'
      ? posts
      : posts.filter((post) => post.meta.tag === selectedTag);

  const handleTagSelect = (tag: string) => {
    if (tag === '') {
      const url = new URL(window.location.href);
      url.searchParams.delete('tag');
      router.push(url.toString());
    } else {
      router.push(`?tag=${tag}`);
    }
  };

  return (
    <div className="min-h-[50vh]">
      <div className="flex gap-3 mt-5">
        <Badge
          variant="outline"
          className={`cursor-pointer mb-1 py-1 border-none bg-card-foreground/5 dark:bg-card-foreground text-black hover:bg-card-foreground/10 ${
            'All' === selectedTag
              ? `bg-[--ui-soft] hover:bg-[--ui-soft] dark:bg-[--ui-soft]`
              : ''
          }`}
          onClick={() => handleTagSelect('')}
        >
          All
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag}
            className={`cursor-pointer mb-1 py-1 border-none bg-card-foreground/5 dark:bg-card-foreground text-black hover:bg-card-foreground/10  ${
              tag === selectedTag
                ? `bg-[--ui-soft] hover:bg-[--ui-soft] dark:bg-[--ui-soft]`
                : ''
            }`}
            onClick={() => handleTagSelect(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="my-10 pb-[320px] grid grid-cols-1 gap-5 w-full md:grid-cols-3">
        {filteredPosts.map((post) => (
          <Link
            href={'/resources/' + post.slug}
            key={post.slug}
            className="flex flex-col w-full border bg-card border-border rounded-xl cursor-pointer p-6 md:p-8 transition duration-300 hover:border-[--ui-primary]"
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
    </div>
  );
};

export default Tag;
