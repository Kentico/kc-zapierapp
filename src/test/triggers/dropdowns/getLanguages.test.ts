import { createAppTester } from 'zapier-platform-core';
import App from '../../../index';
import * as nock from 'nock';
import { LanguageContracts, ManagementClient } from '@kontent-ai/management-sdk';
import getLanguages from '../../../triggers/dropdowns/getLanguages';
import { mockBundle } from '../../utils/mockBundle';
import { createManagementApiPaginatedResponses } from '../../utils/createPaginatedReplies';

const appTester = createAppTester(App);
nock.disableNetConnect();

afterEach(() => nock.cleanAll());

describe('getLanguages', () => {
  it('returns all active languages returned by the CM API', async () => {
    const bundle = mockBundle;

    const expectedRequest = new ManagementClient({
      projectId: bundle.authData.projectId,
      apiKey: bundle.authData.cmApiKey,
    }).listLanguages();

    const expectedRawLanguages: ReadonlyArray<LanguageContracts.ILanguageModelContract> = [
      {
        id: '6ada1bc6-564b-4a8c-a7d3-24dac81292b6',
        name: 'default language',
        codename: 'default_language',
        external_id: 'default_language_external_id',
        is_active: true,
        is_default: true,
      },
      {
        id: '2349a75f-218b-4e3c-a4fc-ebc4124fa8e3',
        name: 'czech',
        codename: 'czech',
        external_id: 'czech_external_language',
        is_active: true,
        is_default: false,
      },
      {
        id: '2e2faab6-17ef-4d9e-91ce-deff8d4c0415',
        name: 'latin',
        codename: 'latin',
        is_active: false,
        is_default: false,
      },
    ];

    createManagementApiPaginatedResponses({
      createInterceptor: () => nock(expectedRequest.getUrl()).persist().get(''),
      responses: expectedRawLanguages,
      pageSize: 1,
      responsePropertyName: 'languages',
    });

    const trigger = App.triggers[getLanguages.key].operation.perform;
    const result = await appTester(trigger, bundle);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "codename": "default_language",
          "id": "6ada1bc6-564b-4a8c-a7d3-24dac81292b6",
          "name": "default language",
        },
        {
          "codename": "czech",
          "id": "2349a75f-218b-4e3c-a4fc-ebc4124fa8e3",
          "name": "czech",
        },
      ]
    `);
  });
});
