import Footer from '@/components/footer';
import Header from '@/components/header';
import Tag from '@/components/tag';
import Container from '@/containers/container';
import fs from 'fs';
import matter from 'gray-matter';
import { BookOpen } from 'lucide-react';
import path from 'path';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';

import styles from '../../styles/components/Banner.module.css';

const POSTS_DIR = path.join(process.cwd(), 'posts');

function getAllPosts() {
  const files = fs.readdirSync(POSTS_DIR);

  return files.map((filename) => {
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
}

export default function BlogPage() {
  const posts = getAllPosts();

  const tags = Array.from(
    new Set(posts.map((post) => post.meta.tag))
  );

  return (
    <>
      <Header />
      <div className={`${styles.banner} ${styles.bannerStory}`}>
        <Container>
          <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
            <Badge
              variant="outline"
              className="mb-1 py-1 border-none bg-[--ui-soft] text-black dark:text-[--ui-primary] dark:bg-[--ui-primary-opacity]"
            >
              Insights <BookOpen className="w-4 h-4 ml-2" />
            </Badge>
            <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
              Resources
            </h1>
            <p className="max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
              Welcome to our corner of the internet. Here we share
              articles, tips, and resources to help you get the most
              out of our platform and stay ahead of the curve.
            </p>
          </div>
        </Container>
      </div>
      <section>
        <Container>
          <Suspense fallback={<div>Loading...</div>}>
            <Tag
              tags={tags}
              posts={posts.map((post) => ({
                meta: {
                  tag: post.meta.tag,
                  date: post.meta.date,
                  title: post.meta.title,
                  description: post.meta.description,
                },
                slug: post.slug,
              }))}
            />
          </Suspense>
        </Container>
      </section>
      <Footer />
    </>
  );
}
