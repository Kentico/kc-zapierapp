function handleErrors(response) {
    if (response.status === 400) {
        throw new Error(`Request failed with code ${response.status}.\nResponse: ${response.content}`);
    }
    if (response.status === 401) {
        throw new Error(`Request failed with code 401. Please disable Secure Access in Kentico Kontent or provide a Secure Access key.`);
    }
    //Allow 404s for requests to specific codename objects (failed request will be handled in code)
    if(response.status === 404) return;

    response.throwForStatus();
}

module.exports = handleErrors;
