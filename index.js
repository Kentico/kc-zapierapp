const authentication = require('./authentication');

const triggerWorkflowStatusChanged = require('./triggers/triggerWorkflowStatusChanged');
const triggerTaxonomyChanged = require('./triggers/triggerTaxonomyChanged');
const triggerItemChanged = require('./triggers/triggerItemChanged');

const getContentItems = require('./triggers/dropdowns/getContentItems');
const getWorkflowSteps = require('./triggers/dropdowns/getWorkflowSteps');
const getContentTypes = require('./triggers/dropdowns/getContentTypes');
const getLanguages = require('./triggers/dropdowns/getLanguages');

const findContentItem = require('./searches/findContentItem');
const findWorkflowStep = require('./searches/findWorkflowStep');
const createContentItem = require('./actions/createContentItem');
const changeContentItemWorkflow = require('./actions/changeContentItemWorkflow');

// We can roll up all our behaviors in an App.
const App = {
    // This is just shorthand to reference the installed dependencies you have. Zapier will
    // need to know these before we can upload
    version: require('./package.json').version,
    platformVersion: require('zapier-platform-core').version,

    authentication: authentication,

    // beforeRequest & afterResponse are optional hooks into the provided HTTP client
    beforeRequest: [],

    afterResponse: [],

    // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
    resources: {},

    // If you want your trigger to show up, you better include it here!
    triggers: {
        [triggerWorkflowStatusChanged.key]: triggerWorkflowStatusChanged,
        [triggerTaxonomyChanged.key]: triggerTaxonomyChanged,
        [triggerItemChanged.key]: triggerItemChanged,

        // Lists for dropdowns
        [getContentTypes.key]: getContentTypes,
        [getContentItems.key]: getContentItems,
        [getWorkflowSteps.key]: getWorkflowSteps,
        [getLanguages.key]: getLanguages,
    },

    // If you want your searches to show up, you better include it here!
    searches: {
        [findContentItem.key]: findContentItem,
        [findWorkflowStep.key]: findWorkflowStep,
    },

    // If you want your creates to show up, you better include it here!
    creates: {
        [createContentItem.key]: createContentItem,
        [changeContentItemWorkflow.key]: changeContentItemWorkflow,
    },

    searchOrCreates: {
        find_item: {
            search: 'find_item',
            create: 'create_item',
            key: 'find_item',
            display: {
                'description': 'Finds a Content item matching the provided parameters. If more items match, it returns the first found item.',
                'label': 'Find or Create Content item'
            }
        }
    }
};

// Finally, export the app.
module.exports = App;
