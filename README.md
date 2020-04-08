[![Stack Overflow](https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white)](https://stackoverflow.com/tags/kentico-kontent)

# Zapier CLI Integration

Source code for the Zapier integration with Kentico Kontent: https://zapier.com/apps/kentico-kontent/integrations.

## Integrations

This integration contains 4 triggers, 4 actions, and 4 searches:

- [__Triggers__](#triggers)
    - Variant workflow step change
    - Variant published status change
    - Variant created or deleted
    - Taxonomy group changed
- __Actions__
    - Create content item
    - Change variant workflow step
    - Update language variant
    - Delete language variant
- [__Searches__](#searches)
    - Find content item
    - Find workflow step
    - Find language
    - Find asset

## Triggers

Using the Kentico Kontent integration, you only need to configure the Zap in Zapier. The creation of the webhook in Kontent is handled automatically by the integration; the webhook will be created when you turn on the Zap, and deleted when you turn it off.

The output of a trigger in Zapier is exactly what [Kontent's webhook](https://docs.kontent.ai/reference/webhooks-reference) POSTs to Zapier. It will looks something like this:

```js
{
    data: {
        items: [
            {
                item: {
                    id: '42c21e82-0772-4d79-a6b3-c916e51b24ff'
                },
                language: {
                    id: '00000000-0000-0000-0000-000000000000'
                }
            }
        ]
    },
    message: {
        id: 'a268da50-b3c5-4d09-9b36-6587c8dea500',
        project_id: '11a3492b-cd32-0054-51d2-8234ec4244a6',
        type: 'content_item_variant',
        operation: 'restore',
        api_name: 'content_management',
        created_timestamp: '2019-07-18T10:52:33.1059256Z',
        webhook_url: 'https://hooks.zapier.com/hooks/standard/47991d003732'
    }
}
```

In each trigger, you have the option to provide a language ID. If you do, the Zap will be halted at this step if the content item is not in the provided language. If you leave it empty, the Zap will proceed for all languages.

There is also another optional field called __Content Type For Samples__. If you choose a content type, the trigger will attempt to output a content item ID of that type. This allows you to test the Zap more efficiently, and has no effect on the functionality of the trigger.

### Creating a trigger in Zapier

1. Create a new Zap: https://zapier.com/app/zaps.
2. In the _Choose App & Event_ field, search for `Kentico Kontent` then choose your trigger.

![step 1](./images/chooseapp.png)

3. Click __Continue__ then __Sign in to Kentico Kontent__ on the next screen. You can find the credentials on the _API Keys_ page in Kontent.

![sign in](./images/authenticate.png)

4. Configure the conditions for your trigger. Most triggers have multiple events that can be "listened" to, and you can select multiple options or leave the field empty for all events.

5. Click __Test and Review__ to get a sample item from your Kontent project. This allows you to configure later steps using fields from your content items.

The output of the triggers will be the payload sent from Kontent, which you can read more about [here](https://docs.kontent.ai/reference/webhooks-reference). To find additional data about the item which triggered the webhook, you can use the __Find Content Item__ action.

## Searches

Because the webhook notification from Kontent only contains basic information such as a content item ID and language ID, you may need to search your project for more information. For example, to load all data about a content item you can use a __Find Content Item__ action. You can search for an item based on the `id`, `codename`, `external_id`, or any of the content type's elements.

Another useful example would be to translate language or workflow step IDs into codenames. The webhook notification contains IDs, but if you need to compare a language codename ("en-US") later on in the Zap, or if you're writing values to a Google Sheet and want to add the user-friendly name, you could add a __Find language__ step. You can search for the language via ID, and in the output you will find all the details of the language:

```js
{
    id: '1c37a40c-9158-031d-9d2d-adf65a568cd6',
    name: 'Czech',
    codename: 'cz-CZ',
    external_id: 'lang_czech',
    is_active: true,
    is_default: false,
    fallback_language: {
        id: '00000000-0000-0000-0000-000000000000'
    }
}
```

## Example - Google calendar

Let's say your company manages events for a client. At this point, you've been using Kentico Kontent to store information about the events, but you've been manually creating the event in Google Calendar and emailing the attendees. We can now use Zapier to do this for us whenever a new event is published.

The final Zap will look something like this:

![finished zap](./images/steps.png)

### Content types in Kontent

To start, we should have an __Event__ content type with fields for basic event information, and a __Linked items__ element which can only contain items from your __Contact__ content type:

![event details](./images/eventdetails.png)

The __Contact__ content type can contain whatever information you'd like, but should at least have an `email` element:

![contact type](./images/contact.png)

Create some Contact content items and publish them, then create an Event and leave it in Draft step.

### Creating the Zap

To reduce the amount of manual work that needs to be done, we want Zapier to create a calendar item and send emails whenever an Event is published in Kontent. 

#### Step 1

Of course, we start with the trigger. For the __Trigger event__ choose _Variant Published Status Changed_. In the configuration of the step, set the following:

![variant published step](./images/variantpublished.png)

Under __Webhook Name__ you can enter any value you'd like such as "Google Calendar Event Creation" which will appear in Kontent's Webhooks page, or you can leave it empty to use the default "Variant published status changed (Zapier)."

#### Step 2

The trigger will fire when any variant is published, but we only want to continue if it is an Event item. We can use the `type` value from the trigger and a __Filter by Zapier__ action to stop the Zap if the type is not "event:"

![filter step](./images/filter.png)

#### Step 3

To get information about the event, we need to add a __Find Content Item__ action. In this step, you can search for an item by ID, external ID or codename. Since the trigger output contains the item ID, you can load that value in the __Search value__ field:

![content item search](./images/itemsearch.png)

#### Step 4

To send emails to the event attendees, we will need to get the contacts stored in the `attendees_list` element. The value of this element will be an array of content item IDs which correspond with the items in step 3's `modular_content` output. So, we can use a __Code by Zapier__ step to get the email addresses of the attendees for the next step.

If you're not familiar with the basics of code steps, please read [Zapier's documentation](https://zapier.com/apps/code/help). In the __Input data__ field we can load some values from the content item to use in javascript:

- __json__: The raw JSON of the modular content from step 3.
- __attendees__: The value of the `attendee_list` element, which contains the IDs of the linked items.

![input data](./images/inputdata.png)

In the code of the step, use JSON to parse the `json` variable, then use `Object.values()` to create an array. Filter the array so that only contacts from the `attendees` variable remain, then `map` the email addresses to a new array. Then, output the emails:

```js
let modular = JSON.parse(inputData.json);
modular = Object.values(modular);
modular = modular.filter(m => inputData.attendees.includes(m.system.id));

const emails = modular.map(m => m.elements.email);

output = [{emails: emails}];
```

#### Step 5

Now we can create the Google Calendar event. In __Choose App & Event__ select _Google Calendar_ and _Create Detailed Event_. On the next screen, you'll need to authorize a Google Account which has access to the calendar you wish to modify.

On the __Customize Detailed Event__ screen, select your calendar then use data from step 3 to populate these fields:

![calendar details](./images/calendardetails.png)

In the event's __Attendees__ field you can load the list of emails from step 4. Google will automatically email the attendees when the event is created.

![attendees](./images/attendees.png)

#### Testing

We're pretty much done- turn on the Zap to create the webhook in Kontent. If the On/Off switch is greyed-out in Zapier, you most likely need to test one of the steps (or, choose __Skip test__). All steps should have a green check mark in the top-left corner.

When the Zap is turned on, you should see this in Kontent:

![webhook](./images/webhook.png)

The endpoint and secret are automatically generated by the Zapier integration and will start to work immediately. __Do not change the secret!__ Webhook signatures are automatically validated by the integration for your security, but it relies on using this exact secret which is generated by hashing several values.

You can now test the Zap by publishing an Event content item in Kontent which has some Contacts linked as attendees. After a short time, you should see the "dot" next to the webhook turn green indicating that the POST was sent to Zapier. In Zapier, you can check __Task History__ in the right sidebar to check whether the Zap executed successfully:

![history](./images/history.png)

![Analytics](https://kentico-ga-beacon.azurewebsites.net/api/UA-69014260-4/Kentico/kontent-zapier-cli?pixel)