import { randomUUID } from 'node:crypto'

import { createApprovedCustomer } from './flows/create-approved-customer'
import { createCustomer } from './flows/create-customer'
import { test, expect } from './fixtures/app.fixture'

test('creates a pending customer with a raw Playwright flow', async ({ page }) => {
  const customer = await createCustomer(
    { page },
    {
      name: `Pending ${randomUUID().slice(0, 8)}`,
      address: 'Oak Street 4'
    }
  )

  expect(customer.status).toBe('PENDING')
})

test('creates an approved customer with a wrapped flow and custom fixture data', async ({
  page,
  browser,
  riskCredentials
}) => {
  const customer = await createApprovedCustomer(
    {
      page,
      browser,
      provided: {
        riskCredentials
      }
    },
    {}
  )

  expect(customer.status).toBe('APPROVED')
})
