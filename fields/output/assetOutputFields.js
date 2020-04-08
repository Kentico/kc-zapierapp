const assetOutputFields = [
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
        key: 'external_id',
        label: 'External ID',
        type: 'string',
    },
    {
        key: 'file_name',
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
        key: 'image_height',
        label: 'Height',
        type: 'number',
    },
    {
        key: 'image_width',
        label: 'Width',
        type: 'number',
    },
    {
        key: 'type',
        label: 'File type',
        type: 'string',
    },
    {
        key: 'last_modified',
        label: 'Last modified',
        type: 'datetime',
    },
    {
        key: 'file_reference__id',
        label: 'Asset reference ID',
        type: 'string',
    },
    {
        key: 'file_reference__type',
        label: 'Asset reference type',
        type: 'string',
    },
    {
        key: 'folder__id',
        label: 'Asset folder ID',
        type: 'string',
    }
];

module.exports = assetOutputFields;
