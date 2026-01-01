import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
}

const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setOgTag = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMetaTag('description', description);
      setOgTag('og:description', description);
    }
    setOgTag('og:title', title);
  }, [title, description]);

  return null;
}
