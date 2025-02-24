const JCRJSONScraper = require('../actions/SlingJSONScraper');

jest.mock('./../actions/AEMServiceCredentials');
const AEMServiceCredentials = require('../actions/AEMServiceCredentials');
const mockGetToken = jest.fn();
AEMServiceCredentials.mockImplementation(() => ({
  getToken: mockGetToken
}));

const { http, HttpResponse } = require('msw');
const { setupServer } = require('msw/node');
const server = setupServer();
beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }); });
afterAll(() => { server.close(); });

beforeEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

describe('JCRJSONScraper', () => {

  it('will throw ims error', async () => {

    // arrange
    mockGetToken.mockRejectedValue(new Error('uh-oh, spaghetti-o'));
    // act
    const promise = new JCRJSONScraper('https://example.com', '/foo/bar').scrape({ foo: 'bar' });
    // assert
    await expect(promise).rejects.toThrow('uh-oh, spaghetti-o');
    expect(AEMServiceCredentials).toHaveBeenCalledTimes(1);
    expect(AEMServiceCredentials).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockGetToken).toHaveBeenCalledTimes(1);
  });

  it('will throw http error', async () => {

    // arrange
    mockGetToken.mockResolvedValue('Supercalifragilisticexpialidocious');
    server.use(
      http.get(
        'https://example.com/foo/bar.infinity.json',
        () => new HttpResponse.error()),
      { once: true }
    );
    // act
    const promise = new JCRJSONScraper('https://example.com', '/foo/bar').scrape({ foo: 'bar' });
    // assert
    await expect(promise).rejects.toThrow('Request failed with status code 500');
    expect(AEMServiceCredentials).toHaveBeenCalledTimes(1);
    expect(AEMServiceCredentials).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockGetToken).toHaveBeenCalledTimes(1);
  });

  it('can build a document', async () => {

    // arrange
    mockGetToken.mockResolvedValue('Supercalifragilisticexpialidocious');
    server.use(
      http.get(
        'https://example.com/foo/bar.infinity.json',
        ({ request }) =>
          ('Bearer Supercalifragilisticexpialidocious' !== request.headers.get('Authorization')) ?
            new HttpResponse('Missing auth header', { status: 401 })
            :
            HttpResponse.json({
              'jcr:content': {
                'jcr:title': 'foo',
                'jcr:description': 'bar',
                'cq:tags': ['hello', 'world']
              }
            }),
        { once: true })
    );

    // act
    return new JCRJSONScraper('https://example.com', '/foo/bar').scrape({ foo: 'bar' })
      .then(result => {
        // assert
        expect(AEMServiceCredentials).toHaveBeenCalledTimes(1);
        expect(AEMServiceCredentials).toHaveBeenCalledWith({ foo: 'bar' });
        expect(mockGetToken).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          id: 'foobar',
          path: '/foo/bar',
          url: 'https://example.com/foo/bar.html',
          title: 'foo',
          description: 'bar',
          keywords: [
            'hello',
            'world'
          ]
        });
      });

  });

});
