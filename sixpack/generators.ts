import { adaptPlaywrightFlow } from '@sixpack-dev/playwright-sixpack-adapter'

import { createApprovedCustomer } from '../tests/flows/create-approved-customer'
import { createCustomer } from '../tests/flows/create-customer'
import {
  approvedCustomerStockTemplates,
  createApprovedCustomerInputSchema,
  createApprovedCustomerOutputSchema,
  createCustomerInputSchema,
  createCustomerOutputSchema
} from './customer.schemas'

const playwrightRuntime = {
  playwrightProject: {
    config: 'playwright.config.ts',
    project: 'chromium'
  }
}

export const createCustomerGenerator = adaptPlaywrightFlow({
  name: 'create-customer',
  flow: createCustomer,
  inputSchema: createCustomerInputSchema,
  outputSchema: createCustomerOutputSchema,
  runtime: playwrightRuntime,
  validation: {
    modulePath: './tests/flows/create-customer.ts',
    exportName: 'createCustomer'
  }
})

export const createApprovedCustomerGenerator = adaptPlaywrightFlow({
  name: 'create-approved-customer',
  flow: createApprovedCustomer,
  inputSchema: createApprovedCustomerInputSchema,
  outputSchema: createApprovedCustomerOutputSchema,
  templates: approvedCustomerStockTemplates,
  runtime: playwrightRuntime,
  validation: {
    modulePath: './tests/flows/create-approved-customer.ts',
    exportName: 'createApprovedCustomer'
  }
})

export const generators = [
  createCustomerGenerator,
  createApprovedCustomerGenerator
]
