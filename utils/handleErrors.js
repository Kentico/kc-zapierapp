function handleErrors(response) {
    if (response.status === 400) {
        throw new Error(`Request failed with code ${response.status}.\nResponse: ${response.content}`);
    }
    //Allow 404s for requests to specific codename objects
    if(response.status === 404) return;
    response.throwForStatus();
}

module.exports = handleErrors;
