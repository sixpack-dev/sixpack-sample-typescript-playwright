import { test as base } from '@playwright/test'

export type Credentials = {
  username: string
  password: string
}

type AppFixtures = {
  riskCredentials: Credentials
}

export const test = base.extend<AppFixtures>({
  riskCredentials: async ({}, use) => {
    await use({
      username: 'risk1',
      password: '123'
    })
  }
})

export { expect } from '@playwright/test'
