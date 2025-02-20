const cheerio = require('cheerio');

module.exports = class HTMLScraper {

    #sourceUrl;
    #path;
    #dataUrl;

    constructor(sourceUrl, path) {
        this.#sourceUrl = sourceUrl;
        this.#path = path;
        this.#dataUrl = `${this.#sourceUrl}${this.#path}.html`;
    }

    scrape = () => fetch(this.#dataUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`Request failed with status code ${response.status}`);
            }
        })
        .then(html => cheerio.load(html))
        .then(content => content.extract({
            title: 'head > title',
            keywords: {
                selector: 'head > meta[name="keywords"]',
                value: (element) => {
                    const keywords = content(element).attr('content');
                    return keywords ? keywords.split(',') : undefined;
                }
            },
            description: {
                selector: 'head > meta[name="description"]',
                value: 'content'
            }
        }))
        .then(result => ({
            id: this.#path.replace(/[/]/g, ""),
            path: this.#path,
            url: this.#dataUrl,
            ...result
        }));
};
