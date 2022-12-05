import { Interceptor, Scope } from 'nock';
import { range } from '../../utils/range';
import { SharedContracts } from '@kontent-ai/management-sdk';

type Params = Readonly<{
  createInterceptor: () => Interceptor;
  responsePropertyName: string;
  responses: ReadonlyArray<unknown>;
  pageSize: number;
}>;

export const createManagementApiPaginatedResponses = ({ pageSize, responses, responsePropertyName, createInterceptor, }: Params): ReadonlyArray<Scope> =>
  splitToPages(responses, pageSize)
    .map((page, i, allPages) =>
      createInterceptor()
        .matchHeader('x-continuation', header => (header?.[0] === i.toString()) || (i === 0 && header === undefined)) // for some reason the header is an array of strings instead of (the declared) string and can also be undefined
        .reply(200, {
          [responsePropertyName]: page,
          pagination: createManagementApiPagination(i === allPages.length - 1 ? undefined : i + 1),
        }));

const createManagementApiPagination = (nextPage: number | undefined): SharedContracts.IPaginationModelContract => nextPage === undefined
  ? { continuation_token: null, next_page: null }
  : { continuation_token: nextPage.toString(), next_page: 'next_page_is_not_implemented_in_this_mock' };

const splitToPages = (arr: ReadonlyArray<unknown>, pageSize: number): ReadonlyArray<ReadonlyArray<unknown>> =>
  range(Math.ceil(arr.length / pageSize)).map(i => arr.slice(i, i + pageSize));
