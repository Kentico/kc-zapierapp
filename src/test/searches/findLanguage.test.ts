import { createAppTester } from 'zapier-platform-core';
import * as nock from 'nock';
import { addInputData, mockBundle } from '../utils/mockBundle';
import { LanguageContracts, ManagementClient } from '@kontent-ai/management-sdk';
import App from '../../index';
import { KontentBundle } from '../../types/kontentBundle';
import { findLanguage, InputData } from '../../searches/findLanguage';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe("findLanguage", () => {
  it("returns language returned from the CM API", async () => {
    const bundle: KontentBundle<
      Omit<InputData, "searchValue" | "searchField">
    > = addInputData(mockBundle, { searchPattern: "{0}={1}" });

    const client = new ManagementClient({
      projectId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    });

    const expectedByIdRequest = client
      .viewLanguage()
      .byLanguageId(rawLanguage.id);

    const expectedByExternalIdRequest = client
      .viewLanguage()
      .byExternalId(rawLanguage.external_id || "");

    const expectedByCodenameRequest = client
      .viewLanguage()
      .byLanguageCodename(rawLanguage.codename);

    nock(expectedByIdRequest.getUrl()).get("").reply(200, rawLanguage);
    nock(expectedByExternalIdRequest.getUrl()).get("").reply(200, rawLanguage);
    nock(expectedByCodenameRequest.getUrl()).get("").reply(200, rawLanguage);

    const search = App.searches[findLanguage.key].operation.perform;

    const resultById = await appTester(
      search,
      addInputData(bundle, { searchField: "id", searchValue: rawLanguage.id })
    );

    expect(resultById).toMatchInlineSnapshot(`
      [
        {
          "codename": "my_default_language",
          "externalId": "great_external_id",
          "fallbackLanguage": {
            "id": undefined,
          },
          "id": "4b21a4ba-4912-42cd-bcc1-d5c359c6e193",
          "isActive": true,
          "isDefault": true,
          "name": "My default language",
        },
      ]
    `);

    const resultByExternalId = await appTester(
      search,
      addInputData(bundle, {
        searchField: "externalId",
        searchValue: rawLanguage.external_id || "",
      })
    );

    expect(resultByExternalId).toMatchInlineSnapshot(`
      [
        {
          "codename": "my_default_language",
          "externalId": "great_external_id",
          "fallbackLanguage": {
            "id": undefined,
          },
          "id": "4b21a4ba-4912-42cd-bcc1-d5c359c6e193",
          "isActive": true,
          "isDefault": true,
          "name": "My default language",
        },
      ]
    `);

    const resultByCodename = await appTester(
      search,
      addInputData(bundle, {
        searchField: "codename",
        searchValue: rawLanguage.codename,
      })
    );

    expect(resultByCodename).toMatchInlineSnapshot(`
      [
        {
          "codename": "my_default_language",
          "externalId": "great_external_id",
          "fallbackLanguage": {
            "id": undefined,
          },
          "id": "4b21a4ba-4912-42cd-bcc1-d5c359c6e193",
          "isActive": true,
          "isDefault": true,
          "name": "My default language",
        },
      ]
    `);
  });
});

const rawLanguage: LanguageContracts.ILanguageModelContract = {
  id: "4b21a4ba-4912-42cd-bcc1-d5c359c6e193",
  name: "My default language",
  codename: "my_default_language",
  is_default: true,
  is_active: true,
  external_id: "great_external_id",
};
