import type { PageContext } from "@/lib/actions/types";

export interface Suggestion {
  label: string;
  action: string;
  icon?: string;
}

export function getSuggestions(pageContext: PageContext, locale: string = "zh"): Suggestion[] {
  const isZh = locale === "zh";

  switch (pageContext.type) {
    case "blog-post":
      return [
        { label: isZh ? "总结这篇文章" : "Summarize this article", action: isZh ? "请总结这篇文章的主要内容" : "Please summarize the main points of this article" },
        { label: isZh ? "推荐相关文章" : "Recommend related articles", action: isZh ? "推荐与这篇文章相关的其他文章" : "Recommend other articles related to this one" },
        {
          label: isZh ? "解释当前章节" : "Explain current section",
          action: isZh ? `请解释"${pageContext.section || "当前章节"}"的内容` : `Please explain the content of "${pageContext.section || "the current section"}"`,
        },
        { label: isZh ? "跳转到其他文章" : "Navigate to other articles", action: isZh ? "帮我找到关于其他主题的文章" : "Help me find articles on other topics" },
      ];
    case "blog-list":
      return [
        { label: isZh ? "搜索文章" : "Search articles", action: isZh ? "搜索关于特定主题的文章" : "Search articles on a specific topic" },
        { label: isZh ? "浏览所有标签" : "Browse all tags", action: isZh ? "列出所有文章标签" : "List all article tags" },
      ];
    case "project":
      return [
        {
          label: isZh ? "查看项目详情" : "View project details",
          action: pageContext.slug
            ? isZh ? `介绍${pageContext.title}这个项目` : `Tell me about the project ${pageContext.title}`
            : isZh ? "介绍项目" : "Introduce the project",
        },
        { label: isZh ? "查找类似项目" : "Find similar projects", action: isZh ? "推荐类似的项目" : "Recommend similar projects" },
      ];
    case "about":
      return [{ label: isZh ? "了解更多" : "Learn more", action: isZh ? "介绍一下这个网站的作者" : "Tell me about the author of this site" }];
    case "home":
      return [
        { label: isZh ? "浏览博客" : "Browse blog", action: isZh ? "推荐一些值得阅读的文章" : "Recommend some articles worth reading" },
        { label: isZh ? "查看项目" : "View projects", action: isZh ? "介绍一下网站上的项目" : "Introduce the projects on this site" },
      ];
    default:
      return [{ label: isZh ? "搜索内容" : "Search content", action: isZh ? "搜索网站上的内容" : "Search content on this site" }];
  }
}
