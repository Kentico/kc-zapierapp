# Zapier CLI Integration

Source code for the Zapier integration with Kentico Kontent

## Integrations

This integration contains 4 triggers, 4 actions, and 2 searches:

- __Triggers__
    - Variant workflow step change
    - Variant published status change
    - Variant created or deleted
    - Taxonomy group changed
- __Actions__
    - Create content item
    - Change variant workflow step
    - Update language variant
    - Delete language variant
- __Searches__
    - Find content item
    - Find workflow step

## Creating a trigger in Zapier

Using the Kentico Kontent integration, you only need to configure the Zap in Zapier. The creation of the webhook in Kontent is handled automatically by the integration; the webhook will be created when you turn on the Zap, and deleted when you turn it off.

1. Create a new Zap: https://zapier.com/app/zaps.
2. In the _Choose App & Event_ field, search for `Kentico Kontent` then choose your trigger.

![step 1](https://github.com/kentico-ericd/kc-zapierapp/blob/master/images/step1.png?raw=true)

3. Click __Continue__ then __Sign in to Kentico Kontent__ on the next screen. You can find the credentials on the _API Keys_ page in Kontent.

![sign in](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/authenticate.png?raw=true)

4. Configure the conditions for your trigger. Most triggers have multiple events that can be "listened" to, and you can select multiple options or leave the field empty for all events.  
  Triggers will output the language variant or taxonomy group which fired the webhook as its output. However, each trigger also contains an __Addtional Step Output__ field where you can choose to output more data fromt he step, if you need it in later steps. For example, choosing _Raw JSON of variant_ will return the Delivery response for an item allowing you to access the `modular_content` later on.

5. Click __Test and Review__ to get a sample item from your Kontent project. This allows you to configure later steps using fields from your content items.

## Example - Google calendar

Let's say your company manages events for a client. At this point, you've been using Kentico Kontent to store information about the events, but you've been manually creating the event in Google Calendar and emailing the attendees. We can now use Zapier to do this for us whenever a new event is published.

### Content types in Kontent

To start, we should have an __Event__ content type with 2 content groups- one for the event details:

![event details](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/eventdetails.png?raw=true)

and one for the attendees, a notification option, and a note:

![event details](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/eventattendees.png?raw=true)

The event's `attendee_list` is a linked item element which can only contain items from your __Contact__ content type:

![event details](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/contact.png?raw=true)

### Creating the Zap

To reduce the amount of manual work that needs to be done, we want Zapier to create a calendar item and send emails whenever an Event is published in Kontent. The final product will look like this:

![event details](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/steps.png?raw=true)

Let's start with the trigger. For the __Trigger event__ choose _Variant published status change_. In the configuration of the step, set the following:

![event details](https://raw.githubusercontent.com/kentico-ericd/kc-zapierapp/master/images/step1config.png?raw=true)

We need to select _Raw JSON of variant_ in the __Additional Step Output__ field so that we can parse the attendees modular content in the next step.