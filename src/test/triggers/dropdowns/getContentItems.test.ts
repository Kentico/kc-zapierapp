import { createAppTester } from "zapier-platform-core";
import App from "../../../index";
import * as nock from "nock";
import { mockBundle } from "../../utils/mockBundle";
import { Contracts, DeliveryClient } from "@kontent-ai/delivery-sdk";
import { KontentBundle } from "../../../types/kontentBundle";
import getContentItems from "../../../triggers/dropdowns/getContentItems";
import { ManagementClient } from "@kontent-ai/management-sdk";
import { createUTCDate } from "../../utils/date";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("getContentItems", () => {
  it("returns all content items returned by the Delivery API", async () => {
    const expectedPage = 3;
    const bundle: KontentBundle<{}> = {
      ...mockBundle,
      meta: { ...mockBundle.meta, page: expectedPage },
    };

    const expectedRequest = new DeliveryClient({
      projectId: bundle.authData.projectId,
      previewApiKey: "previewAPIKey",
    })
      .items()
      .queryConfig({ usePreviewMode: true })
      .limitParameter(10)
      .skipParameter(10 * expectedPage)
      .depthParameter(0)
      .orderByAscending("system.name");

    const expectedRawContentItems: ReadonlyArray<Contracts.IContentItemContract> =
      [
        {
          system: {
            id: "2734c1cb-3b52-46ef-954d-9c1c12a5da58",
            name: "content item 1",
            codename: "content_item_1",
            last_modified: createUTCDate(1212, 9, 26).toISOString(),
            type: "21c631c7-41ce-45d8-9986-1002c1243e14",
            collection: "default",
            language: languages[0].codename,
            workflow_step: "draft",
            sitemap_locations: [],
          },
          elements: {},
        },
        {
          system: {
            id: "878609b4-11dd-4ef8-a394-06a2f5b0c26d",
            name: "content item 2",
            codename: "content_item_2",
            last_modified: createUTCDate(1316, 5, 14).toISOString(),
            type: "9d449599-5353-41d8-8167-7ed740d19543",
            collection: "some_collection",
            language: languages[1].codename,
            workflow_step: null,
            sitemap_locations: ["9e647f7c-51c1-4186-9901-2ff41470ffe8"],
          },
          elements: {},
        },
      ];

    const url = expectedRequest.getUrl();
    nock(url.slice(0, url.indexOf("?")))
      .get("")
      .query(new URLSearchParams(url.slice(url.indexOf("?") + 1)))
      .reply(200, {
        items: expectedRawContentItems,
        modular_content: {},
        pagination: {},
      });

    const expectedLanguagesRequest = new ManagementClient({
      projectId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    }).listLanguages();

    nock(expectedLanguagesRequest.getUrl())
      .get("")
      .reply(200, { languages, pagination: {} });

    const trigger = App.triggers[getContentItems.key].operation.perform;
    const result = await appTester(trigger, bundle);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "codename": "content_item_1",
          "fullId": "2734c1cb-3b52-46ef-954d-9c1c12a5da58/c12c2ee8-14b2-4cba-a397-b1dd61916cb0",
          "id": "2734c1cb-3b52-46ef-954d-9c1c12a5da58",
          "language": "default_language",
          "languageId": "c12c2ee8-14b2-4cba-a397-b1dd61916cb0",
          "lastModified": "1212-09-26T00:00:00.000Z",
          "name": "content item 1",
          "type": "21c631c7-41ce-45d8-9986-1002c1243e14",
          "workflowStep": "draft",
        },
        {
          "codename": "content_item_2",
          "fullId": "878609b4-11dd-4ef8-a394-06a2f5b0c26d/ea41ad6e-a75c-4246-99d9-3293768c74f0",
          "id": "878609b4-11dd-4ef8-a394-06a2f5b0c26d",
          "language": "czech",
          "languageId": "ea41ad6e-a75c-4246-99d9-3293768c74f0",
          "lastModified": "1316-05-14T00:00:00.000Z",
          "name": "content item 2",
          "type": "9d449599-5353-41d8-8167-7ed740d19543",
          "workflowStep": "",
        },
      ]
    `);
  });
});

const languages = [
  {
    id: "c12c2ee8-14b2-4cba-a397-b1dd61916cb0",
    name: "Default Language",
    codename: "default_language",
    is_default: true,
    is_active: true,
  },
  {
    id: "ea41ad6e-a75c-4246-99d9-3293768c74f0",
    name: "Czech",
    codename: "czech",
    is_default: false,
    is_active: true,
  },
] as const;
