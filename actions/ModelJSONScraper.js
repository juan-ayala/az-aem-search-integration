module.exports = class ModelJSONScraper {

    #sourceUrl;
    #path;
    #dataUrl;

    constructor(sourceUrl, path) {
        this.#sourceUrl = sourceUrl;
        this.#path = path;
        this.#dataUrl = `${this.#sourceUrl}${this.#path}.model.json`;
    }

    scrape = async () => fetch(this.#dataUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Request failed with status code ${response.status}`);
            }
        })
        .then(json => {

            const properties = {};

            const pageData = json.dataLayer[Object.keys(json.dataLayer)[0]];
            properties.title = pageData['dc:title'];
            const keywords = pageData['xdm:tags'];
            if (keywords) {
                properties.keywords = keywords;
            }
            const description = pageData['dc:description'];
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
};