const AEMServiceCredentials = require('./AEMServiceCredentials');

module.exports = class JCRJSONScraper {

    #sourceUrl;
    #path;
    #dataUrl;

    constructor(sourceUrl, path) {
        this.#sourceUrl = sourceUrl;
        this.#path = path;
        this.#dataUrl = `${this.#sourceUrl.replace(/publish-/g, 'author-')}${this.#path}.infinity.json`;
    }

    async scrape(params) {

        return new AEMServiceCredentials(params)
            .getToken()
            .then(token => ({ headers: { Authorization: `Bearer ${token}` } }))
            .then(headers => fetch(this.#dataUrl, headers))
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Request failed with status code ${response.status}`);
                }
            })
            .then(json => json['jcr:content'])
            .then(content => {

                const properties = {};

                const title = content['jcr:title'];
                if (title) {
                    properties.title = title;
                }
                const tags = content['cq:tags'];
                if (tags) {
                    properties.keywords = tags;
                }
                const description = content['jcr:description'];
                if (description) {
                    properties.description = description;
                }

                return properties;
            })
            .then(properties => ({
                id: this.#path.replace(/[/]/g, ""),
                path: this.#path,
                url: `${this.#sourceUrl}${this.#path}.html`,
                ...properties
            }));
    }
};