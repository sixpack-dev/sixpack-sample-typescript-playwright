import { expect, type Page } from '@playwright/test'

import { CustomerWorkspacePage, type CustomerAccount } from '../support/app-pages'

export type CreateCustomerOutput = {
  name: string
  address: string
  customerId: string
  status: 'PENDING'
}

export const createCustomer = async (
  { page }: { page: Page },
  input: CustomerAccount
): Promise<CreateCustomerOutput> => {
  const customerWorkspace = new CustomerWorkspacePage(page)

  await customerWorkspace.goto()
  await customerWorkspace.register(input)
  await customerWorkspace.expectMessage(`Registered ${input.name}`)

  const customerId = await customerWorkspace.customerIdFromName(input.name)
  await expect(customerWorkspace.status(customerId)).toHaveText('PENDING')

  return {
    name: input.name,
    address: input.address,
    customerId,
    status: 'PENDING'
  }
}
