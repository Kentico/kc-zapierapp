function getLinkedItemField(extras) {
    return Object.assign(
        {
            search: "find_item.id",
            list: true,
            dynamic: "get_linked_items.id.system__name",
            type: "string",
            altersDynamicFields: false
        },
        extras || {},
    );
}

module.exports = getLinkedItemField;
