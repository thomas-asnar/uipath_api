﻿# uipath orchestrator API
 
 En attendant que [l'API officielle](https://github.com/UiPath/orchestrator-nodejs) réponde à mes besoins, j'ai repris un bout de code d'un collègue afin de l'exploiter dans un script nodejs d'initialisation des Tenants (création Tenant, uploadLicence, création des Users, des Environnements, des Robots, des Assets, upload des packages, def des Settings, etc.)
 
 Exemple avec node :
 
 ```js
const OrchestratorApiClient = require('../src/orchestrator-api-client')
let tenant = [ "TENANT1", "admin", "passw0rd" ]
let client = new OrchestratorApiClient(
   "https://orchestrator.mondomaine.fr/",
   undefined,
   {strictSSL: false}
)

client.authenticate(...tenant).then((token) => {
 client.getUsers()
   .then(r => console.log(r))
   .catch(err => console.log(err))
}).catch( err => console.log(err) )
```

```
PS D:\Donnees\xxxx\DONNEES\workspace\navrpa\navrpanodejs> node .\test\getUsers.js
{ '@odata.context': 'https://orchestrator.mondomaine.fr/odata/$metadata#Users',
  '@odata.count': 13,
  value:
   [ { Name: 'admin',
       Surname: 'admin',
       UserName: 'admin',
       Domain: null,
       FullName: null,
       EmailAddress: '',
       IsEmailConfirmed: false,
       LastLoginTime: '2018-07-13T15:30:11.05Z',
       IsActive: true,
       CreationTime: '2018-07-13T15:09:31.607Z',
       AuthenticationSource: null,
       Password: null,
       RolesList: [Array],
       LoginProviders: [],
       TenancyName: null,
       Type: 'User',
       Id: 39 },
       (...)
       ]
   }
   ```
