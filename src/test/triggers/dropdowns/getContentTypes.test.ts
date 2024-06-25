import { createAppTester } from "zapier-platform-core";
import App from "../../../index";
import * as nock from "nock";
import { mockBundle } from "../../utils/mockBundle";
import getContentTypes from "../../../triggers/dropdowns/getContentTypes";
import { Contracts, DeliveryClient } from "@kontent-ai/delivery-sdk";
import { createUTCDate } from "../../utils/date";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("getContentTypes", () => {
  it("returns all content types returned by the Delivery API", async () => {
    const bundle = mockBundle;

    const expectedRequest = new DeliveryClient({
      environmentId: bundle.authData.projectId,
      previewApiKey: "previewAPIKey",
    })
      .types()
      .queryConfig({ usePreviewMode: true });

    const expectedRawContentTypes: ReadonlyArray<Contracts.IContentTypeContract> =
      [
        {
          system: {
            id: "8f05d8fb-0a19-4b4a-a72c-96ef46b8ab6f",
            name: "content type 1",
            codename: "content_type_1",
            last_modified: createUTCDate(1212, 9, 26),
          },
          elements: {},
        },
        {
          system: {
            id: "49643885-f8a7-4ebb-b464-87724d3aa64d",
            name: "content type 2",
            codename: "content_type_2",
            last_modified: createUTCDate(1316, 5, 14),
          },
          elements: {},
        },
      ];

    nock(expectedRequest.getUrl())
      .get("")
      .reply(200, { types: expectedRawContentTypes, pagination: {} });

    const trigger = App.triggers[getContentTypes.key].operation.perform;
    const result = await appTester(trigger, bundle);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "codename": "content_type_1",
          "id": "8f05d8fb-0a19-4b4a-a72c-96ef46b8ab6f",
          "lastModified": "1212-09-26T00:00:00.000Z",
          "name": "content type 1",
        },
        {
          "codename": "content_type_2",
          "id": "49643885-f8a7-4ebb-b464-87724d3aa64d",
          "lastModified": "1316-05-14T00:00:00.000Z",
          "name": "content type 2",
        },
      ]
    `);
  });
});
