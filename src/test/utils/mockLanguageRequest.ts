import { LanguageContracts, ManagementClient } from "@kontent-ai/management-sdk";
import * as nock from "nock";

export const mockLanguageRequest = (client: ManagementClient, rawLanguage: LanguageContracts.ILanguageModelContract) => {
  const expectedLanguageRequest = client
    .viewLanguage()
    .byLanguageId(rawLanguage.id);

  nock(expectedLanguageRequest.getUrl())
    .get("")
    .reply(200, rawLanguage)
    .persist();
}