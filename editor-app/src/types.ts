export interface Block {
  id: string;
  type: string;
  props: {
    content?: string;
    heading?: string;
    text?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    margin?: string;
    fontSize?: string;
    textAlign?: string;
    borderRadius?: string;
    columns?: number;
    height?: string;
    title?: string;
    price?: string;
    features?: string[];
    align?: string;
  };
  children?: Block[];
}

export interface Page {
  id?: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  blocks: Block[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  email: string;
  password: string;
}