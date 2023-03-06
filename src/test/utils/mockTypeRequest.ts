import { ContentTypeContracts, ManagementClient } from "@kontent-ai/management-sdk";
import * as nock from "nock";

export const mockTypeRequest = (client: ManagementClient, type: ContentTypeContracts.IContentTypeContract) => {
  const expectedRequest = client
    .viewContentType()
    .byTypeId(type.id);

  nock(expectedRequest.getUrl())
    .get("")
    .reply(200, type)
    .persist();
}
