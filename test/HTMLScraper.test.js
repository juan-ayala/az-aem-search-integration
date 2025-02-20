const HTMLScraper = require('../actions/HTMLScraper');

const { http, HttpResponse } = require('msw');
const { setupServer } = require('msw/node');
const server = setupServer();
beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }); });
afterAll(() => { server.close(); });

beforeEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

describe('HTMLScraper', () => {

  it('will throw http error', async () => {

    // arrange
    server.use(
      http.get(
        'https://example.com/foo/bar.html',
        () => new HttpResponse.error()),
      { once: true }
    );
    // act
    const promise = new HTMLScraper('https://example.com', '/foo/bar').scrape();
    // assert
    await expect(promise).rejects.toThrow('Request failed with status code 500');
  });

  it('can build a document', async () => {

    // arrange
    server.use(
      http.get(
        'https://example.com/foo/bar.html',
        () => HttpResponse.html(`<html><head>
            <title>foo</title>
            <meta name="keywords" content="hello,world">
            <meta name="description" content="bar">
            </head></html>`),
        { once: true })
    );

    // act, assert
    return new HTMLScraper('https://example.com', '/foo/bar').scrape()
      .then(result => expect(result).toEqual({
        id: 'foobar',
        path: '/foo/bar',
        url: 'https://example.com/foo/bar.html',
        title: 'foo',
        description: 'bar',
        keywords: [
          'hello',
          'world'
        ]
      }));

  });

});
