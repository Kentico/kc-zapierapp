import { HttpResponse, ZObject } from 'zapier-platform-core';
import { IDeliveryClientConfig } from '@kontent-ai/delivery-sdk';
import { trackingHeader } from './trackingHeader';

export const createHttpService = (z: ZObject): IDeliveryClientConfig['httpService'] => ({
  getAsync: (call, options) =>
    z.request({
      method: 'GET',
      url: call.url,
      headers: Object.fromEntries(getHeaders(options?.headers).map(h => [h.header, h.value] as const)),
    })
      .then(handleErrors)
      .then(createResponse),

  patchAsync: (call, options) =>
    z.request({
      method: 'PATCH',
      url: call.url,
      body: z.JSON.stringify(call.body),
      headers: Object.fromEntries(getHeaders(options?.headers).map(h => [h.header, h.value] as const)),
    })
      .then(handleErrors)
      .then(createResponse),

  putAsync: (call, options) =>
    z.request({
      method: 'PUT',
      url: call.url,
      body: z.JSON.stringify(call.body),
      headers: Object.fromEntries(getHeaders(options?.headers).map(h => [h.header, h.value] as const)),
    })
      .then(handleErrors)
      .then(createResponse),

  postAsync: (call, options) =>
    z.request({
      method: 'POST',
      url: call.url,
      body: z.JSON.stringify(call.body),
      headers: Object.fromEntries(getHeaders(options?.headers).map(h => [h.header, h.value] as const)),
    })
      .then(handleErrors)
      .then(createResponse),

  deleteAsync: (call, options) =>
    z.request({
      method: 'DELETE',
      url: call.url,
      headers: Object.fromEntries(getHeaders(options?.headers).map(h => [h.header, h.value] as const)),
    })
      .then(handleErrors)
      .then(createResponse),

  createCancelToken: () => ({
    token: null,
    cancel: () => {
    },
  }),
});

const createResponse = (res: HttpResponse) => ({
  status: res.status,
  headers: Object.entries(res.headers).map(([header, value]) => ({ header, value })),
  data: res.data,
  rawResponse: res.content,
  retryStrategy: {
    options: {},
    retryAttempts: 0,
  },
});

export const handleErrors = (response: HttpResponse) => {
  if (response.status === 400) {
    throw new Error(`Request failed with code ${response.status}.\nResponse: ${response.content}`);
  }
  if (response.status === 401) {
    throw new Error(`Request failed with code 401. Please disable Secure Access in Kontent.ai or provide a Secure Access key.`);
  }

  response.throwForStatus();

  return response;
};

type Header = Readonly<{ header: string; value: string }>;

const getHeaders = (passedHeaders: ReadonlyArray<Header> | undefined): ReadonlyArray<Header> =>
  [...passedHeaders ?? [], trackingHeader];
