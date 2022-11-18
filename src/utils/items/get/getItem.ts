import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createManagementClient } from '../../kontentServices/managementClient';
import { ContentItemIdentifierQuery, ViewContentItemQuery } from '@kontent-ai/management-sdk';

type Identifier = Readonly<{
  type: 'id' | 'externalId' | 'codename';
  value: string;
}>;

export function getItem(z: ZObject, bundle: KontentBundle<{}>, identifier: Identifier) {
  const client = createManagementClient(z, bundle)
    .viewContentItem();

  return addIdentifier(client, identifier)
    .toPromise()
    .then(res => res.data);
}

const addIdentifier = (query: ContentItemIdentifierQuery<ViewContentItemQuery>, identifier: Identifier): ViewContentItemQuery => {
  switch (identifier.type) {
    case 'id':
      return query.byItemId(identifier.value);
    case 'codename':
      return query.byItemCodename(identifier.value);
    case 'externalId':
      return query.byItemExternalId(identifier.value);
  }
};
