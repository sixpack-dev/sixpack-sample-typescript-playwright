import { expect, type Locator, type Page } from '@playwright/test'

export type Credentials = {
  username: string
  password: string
}

export type CustomerAccount = {
  name: string
  address: string
}

export class CustomerWorkspacePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/customer')
  }

  async register(account: CustomerAccount): Promise<void> {
    await this.page.getByTestId('register-name-input').fill(account.name)
    await this.page.getByTestId('register-address-input').fill(account.address)
    await this.page.getByTestId('register-submit-button').click()
  }

  async expectMessage(text: string): Promise<void> {
    await expect(this.page.getByTestId('page-message')).toContainText(text)
  }

  customerRowByName(name: string): Locator {
    return this.page.locator("[data-testid^='customer-row-']").filter({ hasText: name }).first()
  }

  async customerIdFromName(name: string): Promise<string> {
    const row = this.customerRowByName(name)
    await expect(row).toBeVisible()
    const testId = await row.getAttribute('data-testid')
    if (!testId) {
      throw new Error(`Missing customer row test id for ${name}`)
    }
    return testId.replace('customer-row-', '')
  }

  status(customerId: string): Locator {
    return this.page.getByTestId(`customer-status-${customerId}`)
  }
}

export class RiskWorkspacePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/risk')
  }

  async login(credentials: Credentials): Promise<void> {
    await this.page.getByTestId('risk-username-input').fill(credentials.username)
    await this.page.getByTestId('risk-password-input').fill(credentials.password)
    await this.page.getByTestId('risk-login-button').click()
  }

  async expectLoggedInAs(username: string): Promise<void> {
    await expect(this.page.getByTestId('risk-current-operator')).toContainText(username)
  }

  customerRowByName(name: string): Locator {
    return this.page.locator("[data-testid^='risk-customer-row-']").filter({ hasText: name }).first()
  }

  async customerIdFromName(name: string): Promise<string> {
    const row = this.customerRowByName(name)
    await expect(row).toBeVisible()
    const testId = await row.getAttribute('data-testid')
    if (!testId) {
      throw new Error(`Missing risk row test id for ${name}`)
    }
    return testId.replace('risk-customer-row-', '')
  }

  async approve(customerId: string): Promise<void> {
    await this.page.getByTestId(`approve-customer-button-${customerId}`).click()
  }

  async expectMessage(text: string): Promise<void> {
    await expect(this.page.getByTestId('page-message')).toContainText(text)
  }
}
