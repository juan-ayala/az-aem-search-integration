const ModelJSONScraper = require('../actions/ModelJSONScraper');

const { http, HttpResponse } = require('msw');
const { setupServer } = require('msw/node');
const server = setupServer();
beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }); });
afterAll(() => { server.close(); });

beforeEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

describe('ModelJSONScraper', () => {

  it('will throw http error', async () => {

    // arrange
    server.use(
      http.get(
        'https://example.com/foo/bar.model.json',
        () => new HttpResponse.error()),
      { once: true }
    );
    // act
    const promise = new ModelJSONScraper('https://example.com', '/foo/bar').scrape();
    // assert
    await expect(promise).rejects.toThrow('Request failed with status code 500');
  });

  it('can build a document', async () => {

    // arrange
    server.use(
      http.get(
        'https://example.com/foo/bar.model.json',
        () => HttpResponse.json({
          dataLayer: {
            page_abc: {
              'dc:title': 'foo',
              'dc:description': 'bar',
              'xdm:tags': ['hello', 'world']
            },
            page_xyz: {
              'dc:title': 'foox',
              'dc:description': 'barx',
              'xdm:tags': ['hello', 'worldx']
            }
          }
        }),
        { once: true })
    );

    // act, assert
    return new ModelJSONScraper('https://example.com', '/foo/bar').scrape()
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
