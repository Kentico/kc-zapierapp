import { createAppTester } from 'zapier-platform-core';
import * as nock from 'nock';
import { addInputData, mockBundle } from '../utils/mockBundle';
import {
  ContentItemContracts,
  ContentTypeContracts,
  LanguageContracts,
  LanguageVariantContracts,
  ManagementClient,
} from '@kontent-ai/management-sdk';
import App from '../../index';
import { KontentBundle } from '../../types/kontentBundle';
import { createContentItem, InputData } from '../../actions/createContentItem';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("createContentItem", () => {
  it("changes WF step", async () => {
    const itemName = "Created item name";
    const itemExternalId = "Created item external id";

    const bundle: KontentBundle<InputData> = addInputData(mockBundle, {
      name: itemName,
      contentTypeId: rawContentType.id,
      externalId: itemExternalId,
      languageId: rawLanguage.id,
    });

    const client = new ManagementClient({
      projectId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    });

    const expectedGetTypeRequest = client
      .viewContentType()
      .byTypeId(rawContentType.id);
    nock(expectedGetTypeRequest.getUrl())
      .get("")
      .reply(200, rawContentType)
      .persist();

    const expectedGetLanguageRequest = client
      .viewLanguage()
      .byLanguageId(rawLanguage.id);
    nock(expectedGetLanguageRequest.getUrl()).get("").reply(200, rawLanguage);

    const expectedCreateItemRequest = client.addContentItem().withData({
      name: itemName,
      type: { codename: rawContentType.codename },
      external_id: itemExternalId,
    });
    const itemId = "e819c466-4b0c-4fd9-9441-b41dd85a1cdc";
    nock(expectedCreateItemRequest.getUrl())
      .post("", JSON.stringify(expectedCreateItemRequest.data))
      .reply(201, {
        id: itemId,
        name: itemName,
        codename: "generated_codename",
        type: { id: rawContentType.id, codename: rawContentType.codename },
        external_id: itemExternalId,
        last_modified: new Date(1993, 1, 1),
        collection: { id: "00000000-0000-0000-0000-000000000000" },
      } as ContentItemContracts.IAddContentItemResponseContract);

    const expectedCreateVariantRequest = client
      .upsertLanguageVariant()
      .byItemId(itemId)
      .byLanguageId(rawLanguage.id)
      .withData(() => []);
    nock(expectedCreateVariantRequest.getUrl())
      .put("", JSON.stringify(expectedCreateVariantRequest.data))
      .reply(201, {
        item: { id: itemId },
        language: { id: rawLanguage.id },
        elements: [],
        last_modified: new Date(1993, 1, 1).toISOString(),
        workflow_step: { id: "3ecd7341-ad09-44b1-b457-4257ba3fa73b" },
      } as LanguageVariantContracts.IUpsertLanguageVariantResponseContract);

    const search = App.creates[createContentItem.key].operation.perform;

    const result = await appTester(search, bundle);

    expect(result).toMatchInlineSnapshot(`
      {
        "elements": {},
        "modular_content": "[]",
        "system": {
          "codename": "generated_codename",
          "contentTypeId": "f14de016-4d57-475d-a855-b12967294a51",
          "externalId": "Created item external id",
          "fullId": "e819c466-4b0c-4fd9-9441-b41dd85a1cdc/ed733acb-e1e2-4c82-bfe4-ae82f73908f9",
          "id": "e819c466-4b0c-4fd9-9441-b41dd85a1cdc",
          "language": "test_language",
          "languageId": "ed733acb-e1e2-4c82-bfe4-ae82f73908f9",
          "lastModified": "1993-01-31T23:00:00.000Z",
          "name": "Created item name",
          "projectId": "ae6f7ad5-766c-4b03-a118-56f65e45db7b",
          "type": "test_content_type",
          "workflowStepId": "3ecd7341-ad09-44b1-b457-4257ba3fa73b",
        },
      }
    `);
  });
});

const rawContentType: ContentTypeContracts.IContentTypeContract = {
  id: "f14de016-4d57-475d-a855-b12967294a51",
  name: "Test content type",
  codename: "test_content_type",
  elements: [],
  last_modified: new Date(1348, 4, 7).toISOString(),
};

const rawLanguage: LanguageContracts.ILanguageModelContract = {
  id: "ed733acb-e1e2-4c82-bfe4-ae82f73908f9",
  name: "Test language",
  codename: "test_language",
  is_active: true,
  is_default: true,
};
