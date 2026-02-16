import type { APIRoute } from "astro";
import { SITE } from "@/config";

export const GET: APIRoute = async () => {
  const markdownContent = `# ${SITE.title}

${SITE.desc}

## Navigation

- [About](/about.md)
- [Recent Posts](/posts.md)
- [Archives](/archives.md)
- [RSS Feed](/rss.xml)

## Links

- Website: [${SITE.website}](${SITE.website})
- RSS: [/rss.xml](/rss.xml)

---

*This is the markdown-only version of ${SITE.title}.*`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
