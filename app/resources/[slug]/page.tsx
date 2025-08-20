import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import CustomMDX from '@/components/custom-mdx';
import Header from '@/components/header';
import Container from '@/containers/container';
import Footer from '@/components/footer';
import { MoveLeft } from 'lucide-react';
import stylesPosts from '../../../styles/components/Blog.module.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import styles from '../../../styles/components/Banner.module.css';

const POSTS_DIR = path.join(process.cwd(), 'posts');

function getPost(slug: string) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    redirect('/404');
  }

  const markdownFile = fs.readFileSync(filePath, 'utf-8');
  const { data: frontMatter, content } = matter(markdownFile);

  return { frontMatter, content };
}

export async function generateStaticParams() {
  const files = fs.readdirSync(POSTS_DIR);

  return files.map((filename) => ({
    slug: filename.replace('.mdx', ''),
  }));
}

export default function Page({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const post = getPost(slug);

  return (
    <>
      <Header />
      <div className={`${styles.banner} ${styles.bannerStory}`}>
        <Container>
          <div className="py-[35px] text-center md:pt-[100px] md:pb-[45px]">
            <Button
              variant="link"
              name="Log into Panellio"
              className="w-[300px] mx-auto mt-3"
            >
              <Link
                href="/resources"
                className="flex gap-2 items-center"
              >
                <MoveLeft className="h-4 w-4" />
                Go back to resources
              </Link>
            </Button>
            <h1 className="text-[40px] font-bold mx-auto leading-[1] md:text-[75px]">
              {post.frontMatter.title}
            </h1>
            <p className="max-w-[480px] text-lg font-normal mt-5 md:max-w-[690px] mx-auto md:text-[23px] md:leading-9">
              {post.frontMatter.description}
            </p>
          </div>
        </Container>
      </div>
      <section>
        <Container>
          <div className="max-w-[720px] mx-auto text-foreground/80 text-lg leading-relaxed mt-6">
            <div className={stylesPosts.content}>
              <CustomMDX source={post.content} />
            </div>
          </div>
        </Container>
      </section>
      <Footer />
    </>
  );
}
