import { BlogList } from "@/components/blog-list";

export const metadata = {
  title: "Blog",
  description:
    "Essays, tutorials and field notes on data engineering, geospatial methods and real-estate analytics by Ian Ronk.",
  openGraph: {
    title: "Blog | Ian Ronk",
    description:
      "Essays, tutorials and field notes on data engineering, geospatial methods and real-estate analytics.",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <main>
      <BlogList />
    </main>
  );
}
