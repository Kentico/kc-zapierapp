import { createAppTester } from "zapier-platform-core";
import * as nock from "nock";
import { mockBundle } from "../utils/mockBundle";
import { AssetContracts, ManagementClient } from "@kontent-ai/management-sdk";
import App from "../../index";
import { KontentBundle } from "../../types/kontentBundle";
import { findAsset, InputData } from "../../searches/findAsset";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("findAsset", () => {
  it("returns asset returned from the CM API", async () => {
    const expectedAssetId = "d0ee656f-e16c-4582-a697-d9d4d8df7f2c";
    const expectedAssetExternalId = "80ae417c-af1b-4969-a703-860349a7d2d6";

    const bundleById: KontentBundle<InputData> = {
      ...mockBundle,
      inputData: {
        searchField: "id",
        searchPattern: "{0}={1}",
        searchValue: expectedAssetId,
      },
    };

    const bundleByExternalId: KontentBundle<InputData> = {
      ...bundleById,
      inputData: {
        ...bundleById.inputData,
        searchField: "externalId",
        searchValue: expectedAssetExternalId,
      },
    };

    const client = new ManagementClient({
      projectId: bundleById.authData.projectId,
      apiKey: bundleById.authData.cmApiKey,
    });

    const expectedByIdRequest = client.viewAsset().byAssetId(expectedAssetId);

    const expectedByExternalIdRequest = client
      .viewAsset()
      .byAssetExternalId(expectedAssetExternalId);

    const expectedRawAsset: AssetContracts.IAssetModelContract = {
      id: "d0442642-6e09-44a0-a5d3-1e842030cee6",
      title: "test asset",
      url: "https://bestAsset.test",
      external_id: expectedAssetExternalId,
      type: "image/png",
      file_name: "bestAsset.png",
      folder: {
        id: "56771c7e-33e4-49c8-bffc-83f335e5343f",
      },
      size: 300000,
      descriptions: [],
      image_height: 1080,
      image_width: 1920,
      last_modified: new Date(1278, 8, 26).toISOString(),
      file_reference: {
        type: "internal",
        id: "bc28f312-dab4-4ee3-9f52-e53a1017d324",
      },
    };

    nock(expectedByIdRequest.getUrl()).get("").reply(200, expectedRawAsset);
    nock(expectedByExternalIdRequest.getUrl())
      .get("")
      .reply(200, {
        ...expectedRawAsset,
        title: "test asset found by external id",
      });

    const search = App.searches[findAsset.key].operation.perform;

    const resultById = await appTester(search, bundleById);
    const resultByExternalId = await appTester(search, bundleByExternalId);

    expect(resultById).toMatchInlineSnapshot(`
      [
        {
          "descriptions": [],
          "externalId": "80ae417c-af1b-4969-a703-860349a7d2d6",
          "fileName": "bestAsset.png",
          "fileReference": AssetFileReference {
            "id": "bc28f312-dab4-4ee3-9f52-e53a1017d324",
            "type": "internal",
          },
          "folder": {
            "id": "56771c7e-33e4-49c8-bffc-83f335e5343f",
          },
          "id": "d0442642-6e09-44a0-a5d3-1e842030cee6",
          "imageHeight": 1080,
          "imageWidth": 1920,
          "lastModified": "1278-09-25T23:02:16.000Z",
          "size": 300000,
          "title": "test asset",
          "type": "image/png",
          "url": "https://bestAsset.test",
        },
      ]
    `);

    expect(resultByExternalId).toMatchInlineSnapshot(`
      [
        {
          "descriptions": [],
          "externalId": "80ae417c-af1b-4969-a703-860349a7d2d6",
          "fileName": "bestAsset.png",
          "fileReference": AssetFileReference {
            "id": "bc28f312-dab4-4ee3-9f52-e53a1017d324",
            "type": "internal",
          },
          "folder": {
            "id": "56771c7e-33e4-49c8-bffc-83f335e5343f",
          },
          "id": "d0442642-6e09-44a0-a5d3-1e842030cee6",
          "imageHeight": 1080,
          "imageWidth": 1920,
          "lastModified": "1278-09-25T23:02:16.000Z",
          "size": 300000,
          "title": "test asset found by external id",
          "type": "image/png",
          "url": "https://bestAsset.test",
        },
      ]
    `);
  });
});
