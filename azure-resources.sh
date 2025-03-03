SUBSCRIPTION_NAME=my-subscription-name
GROUP_LOCATION=southcentralus
GROUP_NAME=my-resource-group-name
SEARCH_SERVICE_NAME=my-search-service-name
SEARCH_INDEX_NAME=my-index-name
ENTRA_APP_NAME=my-app-name

# 1. CREATE RESOURCE GORUP AND SEARCH SERVICE

# create the resource group
az group create \
    --location ${GROUP_LOCATION} \
    --subscription ${SUBSCRIPTION_NAME} \
    --name ${GROUP_NAME}

# create the search service
az search service create \
    --location ${GROUP_LOCATION} \
    --resource-group ${GROUP_NAME} \
    --name ${SEARCH_SERVICE_NAME} \
    --sku free \
    --auth-options aadOrApiKey \
    --aad-auth-failure-mode http403

# 2. CREATE SEARCH INDEX

# get token scoped to search
accessToken=$(az account get-access-token \
    --scope https://search.azure.com/.default \
    --query "accessToken" \
    -o tsv)

# create index
curl "https://${SEARCH_SERVICE_NAME}.search.windows.net/indexes?api-version=2024-07-01" \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer ${accessToken}" \
     --data @- << EOF
{
    "name": "${SEARCH_INDEX_NAME}",
    "fields": [
        {
            "type": "Edm.String",
            "name": "id",
            "key": true
        },
        {
            "type": "Edm.String",
            "name": "path",
            "searchable": false
        },
        {
            "type": "Edm.String",
            "name": "url",
            "searchable": true
        },
        {
            "type": "Edm.String",
            "name": "title",
            "searchable": true
        },
        {
            "type": "Edm.String",
            "name": "description",
            "searchable": true
        },
        {
            "type": "Collection(Edm.String)",
            "name": "keywords",
            "searchable": true
        }
    ]
}
EOF

# 3. CREATE SERVICE PRINCIPAL AND RBAC

# create the app registraiton, service principal
appId=$(az ad sp create-for-rbac \
    --name ${ENTRA_APP_NAME} \
    --query 'appId' --out tsv)
# and tag the service principal so it shows up in the enterprise app blade
az ad sp update --id ${appId} --set 'tags=["WindowsAzureActiveDirectoryIntegratedApp"]'

# assign role to service principal to allow read/write to index
searchServiceId=$(az search service list \
                    --resource-group ${GROUP_NAME} \
                    --query "[?name=='${SEARCH_SERVICE_NAME}'].id | [0]" \
                    --out tsv)
az role assignment create \
    --assignee ${appId} \
    --scope "${searchServiceId}/indexes/${SEARCH_INDEX_NAME}" \
    --role "Search Index Data Contributor"
