import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Project, Writing, ProjectFrontmatter, WritingFrontmatter } from './types';

type ContentType = 'projects' | 'writings';

const contentDirectory = path.join(process.cwd(), 'content');

function getDir(contentType: ContentType) {
  return path.join(contentDirectory, contentType);
}

export function getSortedContentData(contentType: 'projects'): Project[];
export function getSortedContentData(contentType: 'writings'): Writing[];
export function getSortedContentData(contentType: ContentType): (Project | Writing)[] {
  const dirPath = getDir(contentType);
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const fileNames = fs.readdirSync(dirPath);
  const allContentData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '');
    const fullPath = path.join(dirPath, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      ...matterResult.data,
    } as Project | Writing;
  });

  return allContentData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllContentSlugs(contentType: ContentType) {
  const dirPath = getDir(contentType);
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const fileNames = fs.readdirSync(dirPath);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.mdx$/, ''),
    };
  });
}

export async function getContentBySlug(slug: string, contentType: 'projects'): Promise<{ slug: string; frontmatter: ProjectFrontmatter; content: string }>;
export async function getContentBySlug(slug: string, contentType: 'writings'): Promise<{ slug: string; frontmatter: WritingFrontmatter; content: string }>;
export async function getContentBySlug(slug: string, contentType: ContentType) { // Added async
  const dirPath = getDir(contentType);
  const fullPath = path.join(dirPath, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data,
    content,
  };
}

export async function getSinglePageContent(fileName: string) {
  const fullPath = path.join(contentDirectory, `${fileName}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    frontmatter: data,
    content,
  };
}
