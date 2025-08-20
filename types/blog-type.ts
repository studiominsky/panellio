export type PostMeta = {
  tag: string;
  date: string;
  title: string;
  description: string;
};

export type Post = {
  meta: PostMeta;
  slug: string;
};

export type TagProps = {
  tags: string[];
  posts: Post[];
};
