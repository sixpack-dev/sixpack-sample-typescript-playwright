import { Supplier } from '@sixpack-dev/sdk'

import { generators } from './generators'

const supplier = new Supplier({
  name: 'sixpack-sample-typescript-playwright',
  reportIssueUrl: 'https://github.com/sixpack-dev/sixpack-sample-typescript-playwright/issues'
}).withGenerators(...generators)

await supplier.bootstrap()
