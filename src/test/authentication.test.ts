import { DeliveryClient } from "@kontent-ai/delivery-sdk";
import App from "../index";
import { ManagementClient } from "@kontent-ai/management-sdk";
import * as nock from "nock";
import { createAppTester } from "zapier-platform-core";
import { KontentBundle } from "../types/kontentBundle";

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("Zapier authentication", () => {
  it("authenticates with properly filled in keys", async () => {
    const authData: KontentBundle<{}>["authData"] = {
      projectId: "37c2f1f3-d7a5-48cd-aa07-3e54e122a274",
      cmApiKey: "fakeCMAPIKey",
      previewApiKey: "fakePreviewAPIKey",
      secureApiKey: "fakeSecureAPIKey",
    };

    const expectedMapiRequest = new ManagementClient({
      projectId: authData.projectId,
      apiKey: authData.cmApiKey,
    }).projectInformation();

    nock(expectedMapiRequest.getUrl())
      .get("")
      .matchHeader("authorization", h => !!h && h.length === 1 && !!h[0]?.includes(authData.cmApiKey))
      .reply(200, JSON.stringify({
        id: authData.projectId,
        name: "Test Project Name",
        environment: "Test Project Environment Name",
        is_production: true,
      }));

    const expectedDeliveryRequest = new DeliveryClient({
      projectId: authData.projectId,
      previewApiKey: authData.previewApiKey,
      secureApiKey: authData.secureApiKey,
      defaultQueryConfig: {
        useSecuredMode: true,
      },
    }).types();

    nock(expectedDeliveryRequest.getUrl())
      .get("")
      .matchHeader("authorization", h => !!h && h.length === 1 && !!h[0]?.includes(authData.secureApiKey ?? ""))
      .reply(200, JSON.stringify({ types: [], pagination: {} }));

    const expectedPreviewRequest = new DeliveryClient({
      projectId: authData.projectId,
      previewApiKey: authData.previewApiKey,
      secureApiKey: authData.secureApiKey,
      defaultQueryConfig: {
        usePreviewMode: true,
      },
    }).types();

    nock(expectedPreviewRequest.getUrl())
      .get("")
      .matchHeader("authorization", h => !!h && h.length === 1 && !!h[0]?.includes(authData.previewApiKey ?? ""))
      .reply(200, JSON.stringify({ types: [], pagination: {} }));

    const result = await appTester(App.authentication.test, { authData });

    expect(result).toMatchInlineSnapshot(`
      {
        "projectName": "Test Project Name",
      }
    `);
  });
});
