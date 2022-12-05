import { searchField, searchInfo, searchPattern, searchValue } from '../fields/filters/assetSearchFields';
import { ZObject } from 'zapier-platform-core';
import { KontentBundle } from '../types/kontentBundle';
import { getAsset } from '../utils/assets/getAsset';
import { getAssetByExternalId } from '../utils/assets/getAssetByExternalId';
import { OutputField } from '../fields/output/outputField';
import { OutputFromOutputFields } from '../fields/output/outputFromOutputFields';
import { AssetModels } from '@kontent-ai/management-sdk';

async function execute(z: ZObject, bundle: KontentBundle<InputData>): Promise<Output> {
  const searchField = bundle.inputData.searchField;
  const searchValue = bundle.inputData.searchValue;

  switch (searchField) {
    case 'id':
      return [await getAsset(z, bundle, searchValue).then(prepareAssetForOutput)];
    case 'externalId':
      return [await getAssetByExternalId(z, bundle, searchValue).then(prepareAssetForOutput)];
    default:
      return [];
  }
}

const outputFields = [
  {
    key: 'descriptions[]language__id',
    label: 'Description language IDs',
    type: 'string'
  },
  {
    key: 'descriptions[]description',
    label: 'Description translations',
    type: 'string'
  },
  {
    key: 'id',
    label: 'Asset ID',
    type: 'string',
  },
  {
    key: 'externalId',
    label: 'External ID',
    type: 'string',
  },
  {
    key: 'fileName',
    label: 'File name',
    type: 'string',
  },
  {
    key: 'title',
    label: 'Title',
    type: 'string',
  },
  {
    key: 'url',
    label: 'Asset URL',
    type: 'string',
  },
  {
    key: 'size',
    label: 'File size in bytes',
    type: 'number',
  },
  {
    key: 'imageHeight',
    label: 'Height',
    type: 'number',
  },
  {
    key: 'imageWidth',
    label: 'Width',
    type: 'number',
  },
  {
    key: 'type',
    label: 'File type',
    type: 'string',
  },
  {
    key: 'lastModified',
    label: 'Last modified',
    type: 'datetime',
  },
  {
    key: 'fileReference__id',
    label: 'Asset reference ID',
    type: 'string',
  },
  {
    key: 'fileReference__type',
    label: 'Asset reference type',
    type: 'string',
  },
  {
    key: 'folder__id',
    label: 'Asset folder ID',
    type: 'string',
  }
] as const satisfies ReadonlyArray<OutputField>;

type Output = ReadonlyArray<OutputFromOutputFields<typeof outputFields>>;

export const findAsset = {
  noun: 'Asset search',
  display: {
    hidden: false,
    important: false,
    description: 'Finds an asset based on its ID or external ID',
    label: 'Find Asset',
  },
  key: 'find_asset',
  operation: {
    perform: execute,
    inputFields: [
      searchInfo,
      searchField,
      searchPattern,
      searchValue,
    ],
    outputFields,
    sample: {
      descriptions: [
        {
          language: {
            id: '00000000-0000-0000-0000-000000000000',
          },
          description: `The asset's alt text for the default language.`,
        },
      ],
      external_id: 'custom-asset-identifier',
      file_name: 'file_name.png',
      file_reference: {
        id: '806ec84e-7c71-4856-9519-ee3dd3558583',
        type: 'internal',
      },
      folder: {
        id: '8fe4ff47-0ca8-449d-bc63-c280efee44ea',
      },
      id: 'fcbb12e6-66a3-4672-85d9-d502d16b8d9c',
      image_height: 548,
      image_width: 1280,
      last_modified: '2019-09-12T08:29:36.1645977Z',
      size: 148636,
      title: 'Makes the asset easier to find when you need it',
      type: 'image/png',
      url: 'https://assets-us-01.kc-usercontent.com/8d20758c-d74c-4f59-ae04-ee928c0816b7/adf26cd2-1acb-403f-9d1e-6d04e46c39f1/file_name.png',
    },
  },
} as const;

export type InputData = Readonly<{
  searchField: string;
  searchPattern: string;
  searchValue: string;
}>;

const prepareAssetForOutput = (asset: AssetModels.Asset): Output[number] => ({
  descriptions: asset.descriptions.map(d => ({ ...d, description: d.description || '', language: { id: d.language.id || '' } })),
  externalId: asset.externalId || '',
  title: asset.title || '',
  imageHeight: asset.imageHeight ?? undefined,
  imageWidth: asset.imageWidth ?? undefined,
  lastModified: asset.lastModified.toISOString(),
  folder: { id: asset.folder?.id ?? undefined },
  url: asset.url,
  type: asset.type,
  size: asset.size,
  id: asset.id,
  fileName: asset.fileName,
  fileReference: asset.fileReference
});
