import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../../../types/kontentBundle';
import { createManagementClient } from '../../kontentServices/managementClient';

type Params = Readonly<{
  name: string;
  contentTypeId: string;
  externalId?: string;
}>;

export const createItem = async (z: ZObject, bundle: KontentBundle<{}>, params: Params) => {
  const client = createManagementClient(z, bundle);

  return client
    .viewContentType()
    .byTypeId(params.contentTypeId)
    .toPromise()
    .then(res => res.data)
    .then(contentType => client
      .addContentItem()
      .withData({
        name: params.name,
        type: {
          codename: contentType.codename,
        },
        external_id: params.externalId,
      })
      .toPromise()
      .then(res => res.data));
};
