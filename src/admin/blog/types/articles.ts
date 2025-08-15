// types/article.ts
export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  readTime: string;
  image: string;
}

export interface ArticleContent {
  content: string[];
  excerpt: string;
}

interface Article {
  title: {
    en: string;
    de: string;
  };
  content: {
    en: { content: string[]; excerpt: string };
    de: { content: string[]; excerpt: string };
  };
  author: Author;
  date: string;
  readTime: string;
  category: string;
  image: string;

  relatedArticles: RelatedArticle[];
}

export interface ArticlesData {
  articles: Article[];
}