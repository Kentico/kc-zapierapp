const taxonomyGroupSample = require('../fields/samples/taxonomyGroupSample');
const getSampleTaxonomyPayload = require('../fields/samples/getSampleTaxonomyPayload');
const getAdditionalTaxonomyOutputFields = require('../fields/getAdditionalTaxonomyOutputFields');
const handleErrors = require('../utils/handleErrors');
const getSecret = require('../utils/getSecret');
const hasValidSignature = require('../utils/hasValidSignature');
const unsubscribeHook = require('../utils/unsubscribeHook');
const makeHookTaxonomyOutput = require('./makeHookTaxonomyOutput');
const hookLabel = 'Taxonomy group changed';
const events = {
    archive: 'Delete',
    restore: 'Restore',
    upsert: 'Create/Update'
};

async function subscribeHook(z, bundle) {
    //If no events were selected, respond to all of them
    let watchedEvents = bundle.inputData.watchedEvents;
    if (!watchedEvents) watchedEvents = Object.keys(events);

    const data = {
        // bundle.targetUrl has the Hook URL this app should call when a recipe is created.
        name: `${bundle.inputData.name || hookLabel} (Zapier)`,
        url: bundle.targetUrl,
        secret: getSecret(z, bundle),
        triggers: {
            delivery_api_content_changes: [
                {
                    type: 'taxonomy',
                    operations: watchedEvents
                }
            ]
        }
    };

    const options = {
        url: `https://manage.kontent.ai/v2/projects/${bundle.authData.projectId}/webhooks`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${bundle.authData.cmApiKey}`
        },
        params: {},
        body: JSON.stringify(data)
    };

    const response = await z.request(options);
    handleErrors(response);

    const webhook = z.JSON.parse(response.content);

    return webhook;
}

async function parsePayload(z, bundle) {
    if(!hasValidSignature(z, bundle)){
        throw new Error('Unable to verify webhook signature.');
    }

    const hookPayload = bundle.cleanedRequest;
    const taxonomies = hookPayload.data.taxonomies;
    const group = taxonomies[0];
    if (!group) {
        throw new z.errors.HaltedError('Skipped, no taxonomy group found.');
    }

    //TODO make group dynamic input, check id instead
    const targetCodename = bundle.inputData.targetCodename;
    if (targetCodename && (group.codename !== targetCodename)) {
        throw new z.errors.HaltedError('Skipped, codename not matched.');
    }

    //If responding to an 'archive' operation, taxonomy group isn't available anymore
    if(hookPayload.message.operation === 'archive') {
        return makeHookTaxonomyOutput(z, bundle, null, hookPayload);
    }
    else {
        return makeHookTaxonomyOutput(z, bundle, group, hookPayload);
    }
}

async function getSampleItem(z, bundle) {
    let url = `https://deliver.kontent.ai/${bundle.authData.projectId}/taxonomies`;
    const targetCodename = bundle.inputData.targetCodename;
    if (targetCodename) url += `/${targetCodename}`;

    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        params: {
            limit: 1
        }
    };

    let sampleGroup;
    const response = await z.request(options);
    handleErrors(response);

    const raw = z.JSON.parse(response.content);
    if (targetCodename && raw.system) {
        //Found group by codename
        sampleGroup = raw;
    }
    else {
        if(raw.taxonomies && raw.taxonomies.length> 0) {
            //Select first group in list
            sampleGroup = raw.taxonomies[0];
        }
        else {
            //No group found, load sample
            sampleGroup = taxonomyGroupSample.taxonomies[0];
        }
    }

    const payload = getSampleTaxonomyPayload(z, bundle, sampleGroup);
    return await makeHookTaxonomyOutput(z, bundle, sampleGroup, payload);
}

module.exports = {
    key: 'deliver_taxonomy_changed',
    noun: hookLabel,
    display: {
        label: hookLabel,
        description: 'Triggers when a taxonomy group is created, deleted, updated, or restored.'
    },
    operation: {
        inputFields: [
            {
                label: 'Webhook name',
                helpText: 'Enter a webhook name which will appear in the Kentico Kontent admin UI.',
                key: 'name',
                type: 'string',
            },
            {
                label: 'Events to watch',
                helpText: 'Fires only when these events are performed on a taxonomy group. Leave blank for all events.',
                key: 'watchedEvents',
                list: true,
                choices: events
            },
            {
                label: 'Taxonomy group code name',
                helpText: 'Fires only for the group of the give code name. Leave blank for all taxonomy groups.',
                key: 'targetCodename',
                type: 'string'
            },
            getAdditionalTaxonomyOutputFields
        ],
        type: 'hook',

        performSubscribe: subscribeHook,
        performUnsubscribe: unsubscribeHook,

        perform: parsePayload,
        performList: getSampleItem,

        sample: taxonomyGroupSample,
    }
};
