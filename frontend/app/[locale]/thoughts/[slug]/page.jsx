import { BlogPost } from "@/components/blog-post";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title,
    description: `Blog post: ${title}`,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  return (
    <main>
      <BlogPost slug={slug} />
    </main>
  );
}
