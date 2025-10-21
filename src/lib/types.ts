export type ProjectFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  image: string;
  githubUrl?: string;
  liveUrl?: string;
};

export type WritingFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
};

export type Project = ProjectFrontmatter & {
  slug: string;
};

export type Writing = WritingFrontmatter & {
  slug: string;
};
