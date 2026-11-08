import type { PaginationQuery } from './schemas';

export const API_PREFIX = '/api/v1';

export type Link = { href: string; method?: string };
export type Links = Record<string, Link>;

export const link = (path: string, method?: string): Link => ({
  href: `${API_PREFIX}${path}`,
  ...(method && { method }),
});

export const toSkip = ({ page, limit }: PaginationQuery) => (page - 1) * limit;

export function paginated<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationQuery,
  path: string,
  extraQuery: Record<string, string> = {},
) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const at = (p: number) => {
    const qs = new URLSearchParams({ ...extraQuery, page: String(p), limit: String(limit) });
    return link(`${path}?${qs}`);
  };

  const _links: Links = { self: at(page), first: at(1), last: at(totalPages) };
  if (page > 1) _links.prev = at(page - 1);
  if (page < totalPages) _links.next = at(page + 1);

  return { data, page, limit, total, totalPages, _links };
}
