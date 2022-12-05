import { KontentBundle } from '../../types/kontentBundle';

export const mockBundle: KontentBundle<{}> = {
  authData: {
    projectId: 'ae6f7ad5-766c-4b03-a118-56f65e45db7b',
    cmApiKey: 'mockCMAPIKey',
    previewApiKey: 'mockCMAPIKey',
  },
  inputData: {},
  inputDataRaw: {},
  meta: {
    isBulkRead: false,
    page: 0,
    isLoadingSample: false,
    isFillingDynamicDropdown: false,
    limit: 10,
    isPopulatingDedupe: false,
    isTestingAuth: false,
  },
};

type AnyReadonlyRecord = Readonly<Record<string, unknown>>;

export const addInputData = <InitialInputData extends AnyReadonlyRecord, AddedInputData extends AnyReadonlyRecord>(
  bundle: KontentBundle<InitialInputData>,
  toAdd: AddedInputData,
): KontentBundle<InitialInputData & AddedInputData> => ({
  ...bundle,
  inputData: {
    ...bundle.inputData,
    ...toAdd,
  },
});
