import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import { addInputData, mockBundle } from "../utils/mockBundle";
import {
  ContentItemContracts,
  ContentTypeContracts,
  LanguageContracts,
  LanguageVariantContracts,
  ManagementClient,
  WorkflowContracts,
  languageVariantElementsBuilder,
} from "@kontent-ai/management-sdk";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import {
  InputData,
  updateLanguageVariant,
} from "../../actions/updateLanguageVariant";
import { createUTCDate } from "../utils/date";
import { mockSnippetsRequest } from "../utils/mockSnippetsRequest";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("updateLanguageVariant", () => {
  it("updates language variant through CM API", async () => {
    const newElementValue = "This is a very new value.";

    const bundle: KontentBundle<
      Omit<InputData, "searchField" | "searchValue">
    > = addInputData(mockBundle, {
      languageId: rawVariant.language.id || "",
      searchPattern: "{0}={1}",
      contentTypeId: rawContentType.id,
      [`elements__${rawContentType.elements[0]?.codename || ""}`]:
        newElementValue,
    });

    const client = new ManagementClient({
      projectId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    });

    const expectedVariantRequest = client
      .viewLanguageVariant()
      .byItemId(rawVariant.item.id || "")
      .byLanguageId(rawVariant.language.id || "");
    nock(expectedVariantRequest.getUrl())
      .get("")
      .reply(200, rawVariant)
      .persist();

    mockSnippetsRequest(client);

    const expectedLanguageRequest = client
      .viewLanguage()
      .byLanguageId(rawLanguage.id);
    nock(expectedLanguageRequest.getUrl())
      .get("")
      .reply(200, rawLanguage)
      .persist();

    const expectedContentTypeRequest = client
      .viewContentType()
      .byTypeId(rawContentType.id);
    nock(expectedContentTypeRequest.getUrl())
      .get("")
      .reply(200, rawContentType)
      .persist();

    const expectedWfRequest = client.listWorkflowSteps();
    nock(expectedWfRequest.getUrl()).get("").reply(200, rawWfSteps);

    const expectedUpdateRequest = client
      .upsertLanguageVariant()
      .byItemId(rawItem.id)
      .byLanguageId(rawLanguage.id)
      .withData((builder) => [
        builder.textElement({
          element: { id: rawContentType.elements[0]?.id || "" },
          value: newElementValue,
        }),
      ]);
    const expectedRawBody = JSON.stringify({
      elements: expectedUpdateRequest.data(languageVariantElementsBuilder),
    });
    nock(expectedUpdateRequest.getUrl())
      .put("", expectedRawBody)
      .reply(200, {
        ...rawVariant,
        elements: [{ ...rawVariant.elements[0], value: newElementValue }],
      });

    const search = App.creates[updateLanguageVariant.key].operation.perform;

    const expectedByIdRequest = client.viewContentItem().byItemId(rawItem.id);
    nock(expectedByIdRequest.getUrl()).get("").reply(200, rawItem);

    const resultById = await appTester(
      search,
      addInputData(bundle, { searchField: "id", searchValue: rawItem.id })
    );

    expect(resultById).toMatchInlineSnapshot(`
      {
        "elements": {
          "text_element": "This is a very new value.",
        },
        "modular_content": "[]",
        "system": {
          "codename": "some_item_name",
          "contentTypeId": "22d83f4d-dec4-458b-8ef8-fc4a05761524",
          "externalId": "item_external_id",
          "fullId": "9d309f21-5326-42e3-ab12-0c4a5e9db64d/e3a742b4-a946-4baa-bf93-39ad1d13834b",
          "id": "9d309f21-5326-42e3-ab12-0c4a5e9db64d",
          "language": "sample_language",
          "languageId": "e3a742b4-a946-4baa-bf93-39ad1d13834b",
          "lastModified": "1316-05-14T00:00:00.000Z",
          "name": "Some Item Name",
          "projectId": "ae6f7ad5-766c-4b03-a118-56f65e45db7b",
          "type": "sample_content_type",
          "workflowStepId": "bc6be0f9-1f99-4acf-b2aa-bb856974a633",
        },
      }
    `);
  });
});

const rawWfSteps: ReadonlyArray<WorkflowContracts.IWorkflowStepContract> = [
  {
    id: "bc6be0f9-1f99-4acf-b2aa-bb856974a633",
    name: "sample step",
    codename: "sample_step",
    transitions_to: [],
  },
];

const rawLanguage: LanguageContracts.ILanguageModelContract = {
  id: "e3a742b4-a946-4baa-bf93-39ad1d13834b",
  name: "Sample language",
  codename: "sample_language",
  is_default: false,
  is_active: true,
};

const rawContentType: ContentTypeContracts.IContentTypeContract = {
  id: "22d83f4d-dec4-458b-8ef8-fc4a05761524",
  name: "Sample content type",
  codename: "sample_content_type",
  last_modified: createUTCDate(1212, 9, 26).toISOString(),
  elements: [
    {
      id: "253ccb11-34f6-4879-932f-648eca309df1",
      type: "text",
      name: "Text element",
      codename: "text_element",
    },
  ],
};

const rawItem: ContentItemContracts.IContentItemModelContract = {
  id: "9d309f21-5326-42e3-ab12-0c4a5e9db64d",
  name: "Some Item Name",
  codename: "some_item_name",
  collection: { id: "1da391cf-d664-4492-a8f4-74420a08a069" },
  type: { id: rawContentType.id },
  external_id: "item_external_id",
  last_modified: createUTCDate(1355, 4, 5),
};

const rawVariant: LanguageVariantContracts.ILanguageVariantModelContract = {
  item: { id: rawItem.id },
  language: { id: rawLanguage.id },
  elements: [
    {
      element: { id: "253ccb11-34f6-4879-932f-648eca309df1" },
      value: "some initial value",
    },
  ],
  last_modified: createUTCDate(1316, 5, 14).toISOString(),
  workflow_step: { id: rawWfSteps[0]?.id || "" },
};
