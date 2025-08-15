export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export type Product = {
  id: number;
  name: string;
  nickname: string;
  category: string;
  price: string;
  description: string;
  features: string[];
  technicalSpecs: Record<string, string>;
  applications: string[];
};