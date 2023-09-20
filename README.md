# Skedulo Action Deploy Packages

This action clone Skedulo packages to another enviroment. You need to get api server url / api token.

## Inputs

### `ORIGIN_API_SERVER`

**Required** Origin Skedulo API Server example: https://api.skedulo.com.

### `ORIGIN_TOKEN`

**Required** Origin Skedulo token API using to run deploy.

### `ORIGIN_ORG_NAME`

**Option** Origin Skedulo org name, example: Cx training.

### `DEST_API_SERVER`

**Required** Destination Skedulo API Server example: https://api.skedulo.com.

### `DEST_TOKEN`

**Required** Destination Skedulo token API using to run deploy.

### `DEST_ORG_NAME`

**Option** Destination Skedulo org name, example: Cx training.

## Example usage

```yaml
steps:
    - uses: sked-hungnguyen/skedulo-migration
    with:
      ORIGIN_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      ORIGIN_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
      ORIGIN_ORG_NAME: ${{ vars.ORG_NAME }}
      DEST_API_SERVER: ${{ vars.SKEDULO_API_SERVER }}
      DEST_TOKEN: ${{ secrets.SKEDULO_API_TOKEN }}
      DEST_ORG_NAME: ${{ vars.ORG_NAME }}
```