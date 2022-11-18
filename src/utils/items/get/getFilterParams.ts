type Params = Readonly<{
  searchField: string;
  searchPattern?: string;
  searchValue: string;
}>;

export const getFilterParams = (params: Params): ReadonlyArray<readonly [string, string]> => {
  const filterQuery = (params.searchPattern || '{0}={1}')
    .replace('{0}', encodeURIComponent(params.searchField))
    .replace('{1}', encodeURIComponent(params.searchValue));

  return filterQuery
    .split('&')
    .map(part => part.split('='))
    .filter((part): part is [string, string] => part.length === 2)
    .map(([part1, part2]) => [decodeURIComponent(part1), decodeURIComponent(part2)]);
};
