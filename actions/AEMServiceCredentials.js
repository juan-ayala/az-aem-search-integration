const { context, getToken } = require('@adobe/aio-lib-ims');

module.exports = class AEMServiceCredentials {

    constructor(params, prefix = 'AEM_SERVICECREDENTIALS_') {

        Object.keys(params)
            .filter(key => key.startsWith(prefix))
            .forEach(key => this[key.replace(prefix, '').toLowerCase()] = params[key]);
        if (this.privateKey) {
            this.privateKey =
                this.privateKey
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r');
        }
        context.set('aem-service-credential-ctx', this)
    }

    getToken = () => getToken('aem-service-credential-ctx');
};
