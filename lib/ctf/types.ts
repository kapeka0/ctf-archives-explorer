export type CtfIndexEntry = {
  slug: string;
  name: string;
  years: string[];
  count: number;
  categories: string[];
};

export type CtfIndex = {
  generatedAt: string;
  stats: { ctfs: number; events: number; challenges: number };
  ctfs: CtfIndexEntry[];
};

export type CtfChallenge = {
  name: string;
  category: string;
  path: string;
  files: number;
};

export type CtfYear = {
  year: string;
  ctftime: string | null;
  challenges: CtfChallenge[];
  categories: { name: string; count: number }[];
};

export type CtfDetail = {
  name: string;
  slug: string;
  ctftime: string | null;
  years: CtfYear[];
};

export const ARCHIVE_REPO = "https://github.com/sajjadium/ctf-archives";

/** GitHub URL for a path inside the archive's ctfs/ directory. */
export function githubTreeUrl(path: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${ARCHIVE_REPO}/tree/main/ctfs/${encoded}`;
}
