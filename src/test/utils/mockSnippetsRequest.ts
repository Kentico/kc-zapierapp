import { ContentTypeSnippetContracts, ManagementClient} from "@kontent-ai/management-sdk"
import * as nock from "nock";

export const mockSnippetsRequest = (client: ManagementClient, snippets?: ReadonlyArray<ContentTypeSnippetContracts.IContentTypeSnippetContract> ) => {
  const expectedSnippetsRequest = client
      .listContentTypeSnippets()

  nock(expectedSnippetsRequest.getUrl())
    .get("")
    .reply(200, {
    snippets: snippets ?? [], 
    pagination: {
      "continuation_token": null,
      "next_page": null
    }})
    .persist();
}