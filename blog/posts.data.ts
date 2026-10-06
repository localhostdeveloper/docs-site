// The blog's post list, read from each post's frontmatter at build time:
// a new post is a new .md file here with title, description and date.
import { createContentLoader } from "vitepress";

export interface Post {
  title: string;
  url: string;
  date: string;
  description: string;
}

declare const data: Post[];
export { data };

export default createContentLoader("blog/*.md", {
  transform(raw): Post[] {
    return raw
      .filter((p) => typeof p.frontmatter.date === "string")
      .map((p) => ({
        title: p.frontmatter.title,
        url: p.url,
        date: p.frontmatter.date,
        description: p.frontmatter.description,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },
});
