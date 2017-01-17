Generate Moyo fixtures with Javascript: `npm run gen`

## Use the fixtures

1. Copy fixtures.edn into the moyo project: `env/dev/resources/core/fixtures.edn`
2. `make rebuild`, then `make dev-server`

### Useful info
During `make rebuild`, the migration will run indefinitely and not log any errors if there is a problem in `fixtures.edn`. To track the status of the migration process, run `docker logs -f moyo_with_rebuild` in another terminal window after migration has begun.
