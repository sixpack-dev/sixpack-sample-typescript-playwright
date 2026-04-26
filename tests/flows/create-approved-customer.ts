import { randomUUID } from 'node:crypto'

import { definePlaywrightFlow, flatInput } from '@sixpack-dev/playwright-flows'
import { expect } from '@playwright/test'
import type { Browser, Page } from 'playwright'

import {
  CustomerWorkspacePage,
  RiskWorkspacePage,
  type Credentials
} from '../support/app-pages'

export type CreateApprovedCustomerInput = {
  name?: string
  address?: string
}

type ResolvedCreateApprovedCustomerInput = {
  name: string
  address: string
}

export type CreateApprovedCustomerOutput = {
  name: string
  address: string
  customerId: string
  status: 'APPROVED'
}

type CreateApprovedCustomerContext = {
  page: Page
  browser: Browser
  provided?: {
    riskCredentials?: Credentials
  }
}

export const createApprovedCustomer = definePlaywrightFlow<
  CreateApprovedCustomerInput,
  CreateApprovedCustomerOutput,
  CreateApprovedCustomerContext,
  {
    customerWorkspace: CustomerWorkspacePage
    riskWorkspace: RiskWorkspacePage
    riskCredentials: Credentials
  },
  ResolvedCreateApprovedCustomerInput
>({
  contract: flatInput<CreateApprovedCustomerInput>(),
  deriveFlowInput({ input, context }) {
    const suffix = randomUUID().slice(0, 8)

    return {
      name: input.name ?? `Customer ${context.datasetId} ${suffix}`,
      address: input.address ?? 'Main Street 1'
    }
  },
  async setup({ page, provided, createRolePage }) {
    const { page: riskPage } = await createRolePage()

    return {
      customerWorkspace: new CustomerWorkspacePage(page),
      riskWorkspace: new RiskWorkspacePage(riskPage),
      riskCredentials: provided.riskCredentials ?? { username: 'risk1', password: '123' }
    }
  },
  async run({ customerWorkspace, riskWorkspace, riskCredentials }, input) {
    await customerWorkspace.goto()
    await customerWorkspace.register(input)
    await customerWorkspace.expectMessage(`Registered ${input.name}`)

    const customerId = await customerWorkspace.customerIdFromName(input.name)
    await expect(customerWorkspace.status(customerId)).toHaveText('PENDING')

    await riskWorkspace.goto()
    await riskWorkspace.login(riskCredentials)
    await riskWorkspace.expectLoggedInAs(riskCredentials.username)
    await riskWorkspace.approve(customerId)
    await riskWorkspace.expectMessage(`Approved ${input.name}`)

    await customerWorkspace.goto()
    await expect(customerWorkspace.status(customerId)).toHaveText('APPROVED')

    return {
      name: input.name,
      address: input.address,
      customerId,
      status: 'APPROVED'
    }
  }
})
