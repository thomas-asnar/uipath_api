const rp = require('request-promise-native')
const fs =require('fs')
const uuidv1 = require('uuid/v1');

// https://orchestrator.uipath.com/v2017.1/reference

module.exports = class OrchestratorApiClient {
    constructor(url, token, options) {
        this.url = url;
        this.token = token;
        this.options = options || {};
    }

    async isAuthenticated() {
        // https://orchestrator.uipath.com/v2017.1/reference#users_getcurrentuser-1

        if (!this.token) return false;

        try {
            const result = (await this._request('GET', '/odata/Users/UiPath.Server.Configuration.OData.GetCurrentUser()'));
            return true;
        } catch (e) {
            if (e.statusCode == 401) {
                return false;
            } else {
                throw e;
            }
        }
    }

    async authenticate(tenant, user, password) {
        // https://orchestrator.uipath.com/v2017.1/reference#account_authenticate_1-1

        var data = {
            "TenancyName": tenant,
            "UsernameOrEmailAddress": user,
            "Password": password
        };
        
        try {
            this.token = (await this._request('POST', '/api/Account/Authenticate', data)).result;
        } catch (e) {
            throw new Error('Invalid user name or password');
        }
        return this.token;
    }

    getTenants() {
        // https://orchestrator.uipath.com/v2017.1/reference#tenants_gettenants-1

        return this._request('GET', '/odata/Tenants').then((data) => data.value);
    }

    getSettings() {
        // https://orchestrator.uipath.com/v2017.1/reference#settings_getsettings-1

        return this._request('GET', '/odata/Settings').then((data) => data.value);
    }

    updateSettings(settings) {
        // https://orchestrator.uipath.com/v2017.1/reference#settings_updatebulk-1

        const data = {
            settings: settings
        };

        return this._request('POST', '/odata/Settings/UiPath.Server.Configuration.OData.UpdateBulk', data);
    }

    uploadLicense(filePath) {
        // https://orchestrator.uipath.com/v2017.1/reference#settings_uploadlicense-1

        var options = this._buildOptions('POST', '/odata/Settings/UiPath.Server.Configuration.OData.UploadLicense')
        options.formData = {
            uploads: [fs.createReadStream(filePath)]
        };

        return rp(options);
    }
    
    uploadPackage(filePath) {
        // https://www.uipath.com/hubfs/Documentation/OrchestratorAPIGuide_2016.2/UiPathOrchestratorAPIGuide_2016.2.html#UploadPackage

        var options = this._buildOptions('POST', '/odata/Processes/UiPath.Server.Configuration.OData.UploadPackage')
        options.formData = {
            uploads: [fs.createReadStream(filePath)]
        };

        return rp(options);
    }

    createTenant(settings) {
        // apparemment le Username par défaut à la création de Tenant est "admin"
        // Tenants.json [ ["NOMTENANT", "admin", "passwd"] ]
        settings = {
            "Name": settings[0],
            "AdminPassword": settings[2]
        }
        return this._request('POST', '/odata/Tenants', settings)
    }

    createRole(settings) {
        return this._request('POST', '/odata/Roles', settings)
    }

    createUser(settings) {
        return this._request('POST', '/odata/Users', settings)
    }

    getEnvironment(name){
        return this._request('GET', "/odata/Environments?$filter=Name eq '"+name+"'")
    }

    createEnvironment(settings) {
        return this._request('POST', '/odata/Environments', settings)
    }

    createAsset(settings) {
        return this._request('POST', '/odata/Assets', settings)
    }

    getRobot(name){
        return this._request('GET', "/odata/Robots?$filter=Name eq '"+name+"'")
    }
    
    createRobot(settings) {
        // On génère automatiquement une clé uuid basé sur le timestamp (v1)
        settings["LicenseKey"] = uuidv1()
        return this._request('POST', '/odata/Robots', settings)
    }
    
    AddRobotToEnv(envId, robotId){
        return this._request('POST', "/odata/Environments("+envId+")/UiPath.Server.Configuration.OData.AddRobot", {
            "robotId" : robotId.toString()
        })
    }

    _buildOptions(method, endpoint, data) {
        return {
            method: method,
            uri: this.url + endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token ? `Bearer ${this.token}` : undefined,
            },
            body: data,
            json: true,
            strictSSL: this.options.strictSSL,
        };
    }

    _request(method, endpoint, data) {
        const options = this._buildOptions(method, endpoint, data);
        //console.log(options);
        return rp(options);
    }
};
