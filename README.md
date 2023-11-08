# Skedulo Action Migrate Enviroment

This action migrate Skedulo packages to another enviroment. You need to get api server url / api token.

## Inputs

### `SOURCE_API_SERVER`

**Required** Source Skedulo API Server example: https://api.skedulo.com.

### `SOURCE_TOKEN`

**Required** Source Skedulo token API using to run deploy.

### `SOURCE_ORG_NAME`

**Option** Source Skedulo org name, example: Cx training.

### `TARGET_API_SERVER`

**Required** Target Skedulo API Server example: https://api.skedulo.com.

### `TARGET_TOKEN`

**Required** Target Skedulo token API using to run deploy.

### `TARGET_ORG_NAME`

**Option** Target Skedulo org name, example: Cx training.

## Example usage

```yaml
steps:
    - uses: sked-hungnguyen/skedulo-migration
    with:
      SOURCE_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      SOURCE_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
      SOURCE_ORG_NAME: ${{ vars.ORG_NAME }}
      TARGET_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      TARGET_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
      TARGET_ORG_NAME: ${{ vars.ORG_NAME }}
```
