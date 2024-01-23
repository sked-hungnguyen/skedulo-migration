# Skedulo Action Migrate Enviroment

This action migrate Skedulo packages to another enviroment. You need to get api server url / api token.

## Inputs

### `SERVICES`

**Services** to migrate: OrgPreference,JobTypes,JobTemplates,CustomFields,CustomForm,Package,Webhook,TriggerActions

**Note**: CustomFields for SF fields mapping only

### `SOURCE_API_SERVER`
skedJobAllocationServices
**Required** Source Skedulo API Server example: https://api.skedulo.com.

### `SOURCE_TOKEN`

**Required** Source Skedulo token API using to run deploy.

### `TARGET_API_SERVER`

**Required** Target Skedulo API Server example: https://api.skedulo.com.

### `TARGET_TOKEN`

**Required** Target Skedulo token API using to run deploy.

## Example usage

```yaml
steps:
    - uses: sked-hungnguyen/skedulo-migration
    with:

      SERVICES: "OrgPreference,JobTypes,JobTemplates,CustomFields,CustomForm,Package,Webhook,TriggerActions,MobileNotifications"
      SOURCE_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      SOURCE_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
      TARGET_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      TARGET_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
```
