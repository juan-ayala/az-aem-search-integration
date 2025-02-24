const AEMServiceCredentials = require('../actions/AEMServiceCredentials');

jest.mock('@adobe/jwt-auth');
const authorize = require('@adobe/jwt-auth');

describe('AEMServiceCredentials', () => {

    it('can construct jwt auth config', () => {

        // arrange
        const params = {
            AEM_SERVICECREDENTIALS_HELLO_WORLD: 'hello,world',
            AEM_SERVICECREDENTIALS_FOO: 'bar'
        };

        // act
        const credential = new AEMServiceCredentials(params);

        // assert
        expect(credential.jwtAuthConfig).toEqual({
            helloWorld: 'hello,world',
            foo: 'bar'
        });
    });

    it('can get a token', async () => {

        // arrange
        const params = { AEM_SERVICECREDENTIALS_HELLO_WORLD: 'hello,world' };
        authorize.mockResolvedValue({ access_token: 'Supercalifragilisticexpialidocious' });

        // act/assert
        await expect(new AEMServiceCredentials(params).getToken()).resolves.toEqual('Supercalifragilisticexpialidocious');
        expect(authorize).toHaveBeenCalledTimes(1);
        expect(authorize).toHaveBeenCalledWith({
            helloWorld: 'hello,world'
        });
    });
});

/*
        const params = {
            AEM_SERVICECREDENTIALS_META_SCOPES: 'ent_aem_cloud_api',
            AEM_SERVICECREDENTIALS_CLIENT_ID: 'cm-p23458-e585661-integration-2',
            AEM_SERVICECREDENTIALS_CLIENT_SECRET: 'p8e-k7CD5T_Rgag4aqEqhtt5KJ4E_KOPXJgV',
            AEM_SERVICECREDENTIALS_TECHNICAL_ACCOUNT_ID: '18C61DB4673F422B0A495E5F@techacct.adobe.com',
            AEM_SERVICECREDENTIALS_ORG_ID: 'E71EADC8584130D00A495EBD@AdobeOrg',
            AEM_SERVICECREDENTIALS_PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\\r\\nMIIEogIBAAKCAQEArhDHOq9u1orErrHpor133eSV3R/vAOnymjX+/JAAiuEgBeAB\\r\\nisnHhWq2DXAIZgDkGTExO2VPy0jpwQbuMjh/KxAcxxENh4VKXEjp2dWNzCg1VABG\\r\\nT7R6Ty6Zxw5CMrgQK+GbWVzbygh0ZMeo6D60w3agKucMndTPq//y6WhKmiFkEWPC\\r\\nF8WBSj5YD6PfbFMz+tRC2zMqp6PX5Hvz10OacSp8kDRLCyPRhiSKy+OnmTre/fMk\\r\\nQ1xwmR+sfeyEr7lfGS5suTmytsPFDh1S2E12fzMFjpPuCVAmx3CGGOfBUSpZ/BVN\\r\\nY8zwcCs7NIWPdnzj70Q9o8i4fyOR3zH5AED56QIDAQABAoIBAGv8CqzUgs1j/0pl\\r\\nIw0Lv54Png01L1+Awzl5//sNFtkRen1Kj4pbTYTuQ4yokP0+1kLuqp0vZ8Y0MJfI\\r\\nReMv+2xqrX+ti5gkT5JaxYCXJEWgOB0ponT2AN64iTvdE6JFX/rpFiflHJEEl7ih\\r\\nyJ5zsE6GfCzBc6lCiacpvLeiNI3S3Nx9C6JK6yy/27QL/vt3BvZ2kkosAG4CrNQr\\r\\n1KiPj/nl9dvYGaU4ts1KVneGWHzCot3kQAfu9I/ytYWsCQIk+W+9LYG66CSNvIqC\\r\\n686B637W+M5WAcZpTt6IgZioiU61tkzfjQRL6LUnFzndH/Z+U1ktbiPJ/RZZ3AfL\\r\\nlH1vkJUCgYEA32Xl5MIBIG7rL99SaAORCQva1ZKxvWZpEN5GyH7nAhf8s1b2jMmT\\r\\n3AQCozyY5ojj8dCAfFEs+e19kH3+germ546cEZhj7PTtz//SnTK/OAgFFG0DqbRZ\\r\\nXXsZIozVgzXyE1SWeOT1UG4kHT9YNZhpHJgeCJ8iBgNlv1ZTwMGvsOcCgYEAx3fU\\r\\nLWTWbxoIQZ8IadF7rMDV/2JlMGrMiBp/VnlpOp1VWvJRGIWWm6mUYlgIz1zZN7aO\\r\\nHawJCekF7q/ox8ZqT8SCSraygy/U2tEBG1pGhQhmm2hU++MaOl3rRpnKaVSuqgkp\\r\\noB19yRFJIl81losxjmJ8Bwhqa7udREWcRhpjFK8CgYBRcQCCiQeIH2e2KCAOs14o\\r\\ngh3hRn1touwiriX36eulo8EIUGfJo6M3zm53vBuxz63p9i0hJSbUZnQkPQqPqmdL\\r\\ne34CHCAxvokEDytlC58Sejn/3E49i/YYUkwzgExGbWA3E9tXb4DPNZgM4Y7y2wFW\\r\\n303zrq/kqVBqlLorx3CZeQKBgCB/GDUxCXJeRlwSgbdjpod1fye1KxEhRSMjVf2L\\r\\nmCYxfbdsZOPe17OShBclioHl+YmHF04kOfDAYvQI+p6ZZ7aJKETt0NVolH/1rv16\\r\\nzqRbwwOskrPawuohZPRCl+RjJHWVOo/YXibExypvYnadRLyStOwcZeIZVbzKrnQJ\\r\\nVn0HAoGAJF7Q8oRBR+jz1WTx8b34TI00wmGmTZH7CftF84FAR2oz0uD5LD2hU3tO\\r\\n5aVUto1hqEGjjSZaC/M0Fp1L+lY7Tnedo8ffq6MHS+3UiyA7tbEsTyoPIgmcOfyI\\r\\nO/Tl6i1Ha7LGVA569VR4wSy1ScoQfxOqiMa+JjpyoXcNBDXUGn0=\\r\\n-----END RSA PRIVATE KEY-----\\r\\n'
        };*/