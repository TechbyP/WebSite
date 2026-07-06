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
  title: string;
  content: string[];
  excerpt: string;
}

export interface Article {
  id: string; // You need this property based on your usage
  content: {
    en: ArticleContent;
    de: ArticleContent;
  };
  author: Author;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  trending?: boolean;
  relatedArticles: RelatedArticle[];
}

export interface ArticlesData {
  articles: Article[];
}