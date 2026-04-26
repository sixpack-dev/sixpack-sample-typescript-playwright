import { s, type Template } from '@sixpack-dev/sdk/item'

import type { CreateApprovedCustomerInput } from '../tests/flows/create-approved-customer'

export const createCustomerInputSchema = {
  name: s.string(),
  address: s.string()
}

export const createCustomerOutputSchema = {
  name: s.string(),
  address: s.string(),
  customerId: s.string(),
  status: s.string()
}

export const createApprovedCustomerInputSchema = {
  name: s
    .string()
    .nullDescription('Auto-generated unique customer name when omitted')
    .optional(),
  address: s
    .string()
    .nullDescription('Uses Main Street 1 when omitted')
    .optional()
}

export const createApprovedCustomerOutputSchema = createCustomerOutputSchema

export const approvedCustomerStockTemplates: Array<Template<CreateApprovedCustomerInput>> = [
  {
    input: {},
    minimum: 3
  }
]
