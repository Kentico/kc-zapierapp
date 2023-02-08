import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../types/kontentBundle';
import { getContentType } from '../../utils/types/getContentType';
import { ContentTypeElements, ManagementClient } from '@kontent-ai/management-sdk';
import { createManagementClient } from '../../utils/kontentServices/managementClient';

export const getContentTypeElements = (z: ZObject, bundle: KontentBundle<{}>, contentTypeId: string) => {
  if (!contentTypeId) {
    return Promise.resolve([]);
  }
  const managementClient = createManagementClient(z, bundle);

  return getContentType(z, bundle, contentTypeId)
    .then(type => Promise.all(type.elements
      .map(el => el.type === 'snippet' ? getSnippetElements(managementClient, el) : Promise.resolve([el])))
      .then(allElements => allElements.flat()));
};

const getSnippetElements = (managementClient: ManagementClient, element: ContentTypeElements.ISnippetElement) =>
  managementClient
    .viewContentTypeSnippet()
    .byTypeId(element.snippet.id ?? '')
    .toPromise()
    .then(res => res.data.elements.map(el => ({
      ...el,
      codename: `${(el as Exclude<typeof el, ContentTypeElements.ISnippetElement>).codename}`, // type override is because of MAPI SDK bad types, snippet cannot contain snippet element
    })));
