import express from 'express'
import type { Request, Response } from 'express'

type CustomerStatus = 'PENDING' | 'APPROVED'

type Customer = {
  id: string
  name: string
  address: string
  status: CustomerStatus
}

const app = express()
const port = Number(process.env.PORT ?? 3010)
const customers: Customer[] = []
let nextCustomerId = 1

app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  res.redirect('/customer')
})

app.get('/customer', (req, res) => {
  renderCustomerPage(res, messageFromQuery(req))
})

app.post('/customer/register', (req, res) => {
  const name = String(req.body.name ?? '').trim()
  const address = String(req.body.address ?? '').trim()

  if (!name || !address) {
    renderCustomerPage(res, 'All fields are required')
    return
  }

  if (customers.some(customer => customer.name === name)) {
    renderCustomerPage(res, `Customer ${name} already exists`)
    return
  }

  customers.push({
    id: `customer-${nextCustomerId++}`,
    name,
    address,
    status: 'PENDING'
  })

  res.redirect(`/customer?message=${encodeURIComponent(`Registered ${name}`)}`)
})

app.get('/risk', (req, res) => {
  const operator = parseCookies(req).risk_operator
  renderRiskPage(res, operator, messageFromQuery(req))
})

app.post('/risk/login', (req, res) => {
  const username = String(req.body.username ?? '').trim()
  const password = String(req.body.password ?? '').trim()

  if (username !== 'risk1' || password !== '123') {
    renderRiskPage(res, undefined, 'Invalid risk credentials')
    return
  }

  res.setHeader('Set-Cookie', `risk_operator=${encodeURIComponent(username)}; Path=/; HttpOnly; SameSite=Lax`)
  res.redirect('/risk?message=Signed%20in')
})

app.post('/risk/approve', (req, res) => {
  const operator = parseCookies(req).risk_operator
  if (!operator) {
    renderRiskPage(res, undefined, 'Sign in before approving customers')
    return
  }

  const customerId = String(req.body.customerId ?? '')
  const customer = customers.find(candidate => candidate.id === customerId)
  if (!customer) {
    renderRiskPage(res, operator, 'Customer not found')
    return
  }

  customer.status = 'APPROVED'
  res.redirect(`/risk?message=${encodeURIComponent(`Approved ${customer.name}`)}`)
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Sample app listening on http://127.0.0.1:${port}`)
})

function renderCustomerPage(res: Response, message = '') {
  res.send(page('Customer workspace', message, `
    <form method="post" action="/customer/register" data-testid="register-form">
      <label>Name <input name="name" data-testid="register-name-input" /></label>
      <label>Address <input name="address" data-testid="register-address-input" /></label>
      <button type="submit" data-testid="register-submit-button">Register</button>
    </form>
    <section>
      <h2>Customers</h2>
      <table>
        <thead>
          <tr><th>Customer ID</th><th>Name</th><th>Address</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${customers.map(customer => `
            <tr data-testid="customer-row-${escapeHtml(customer.id)}">
              <td data-testid="customer-id-${escapeHtml(customer.id)}">${escapeHtml(customer.id)}</td>
              <td>${escapeHtml(customer.name)}</td>
              <td>${escapeHtml(customer.address)}</td>
              <td data-testid="customer-status-${escapeHtml(customer.id)}">${escapeHtml(customer.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `))
}

function renderRiskPage(res: Response, operator?: string, message = '') {
  const body = operator ? `
    <p data-testid="risk-current-operator">Signed in as ${escapeHtml(operator)}</p>
    <table>
      <thead>
        <tr><th>Customer ID</th><th>Name</th><th>Status</th><th>Action</th></tr>
      </thead>
      <tbody>
        ${customers.map(customer => `
          <tr data-testid="risk-customer-row-${escapeHtml(customer.id)}">
            <td>${escapeHtml(customer.id)}</td>
            <td>${escapeHtml(customer.name)}</td>
            <td data-testid="risk-customer-status-${escapeHtml(customer.id)}">${escapeHtml(customer.status)}</td>
            <td>
              ${customer.status === 'PENDING' ? `
                <form method="post" action="/risk/approve">
                  <input type="hidden" name="customerId" value="${escapeHtml(customer.id)}" />
                  <button type="submit" data-testid="approve-customer-button-${escapeHtml(customer.id)}">Approve</button>
                </form>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <form method="post" action="/risk/login" data-testid="risk-login-form">
      <p data-testid="risk-login-hint">Use risk1 / 123</p>
      <label>Username <input name="username" data-testid="risk-username-input" /></label>
      <label>Password <input name="password" type="password" data-testid="risk-password-input" /></label>
      <button type="submit" data-testid="risk-login-button">Sign in</button>
    </form>
  `

  res.send(page('Risk workspace', message, body))
}

function page(title: string, message: string, body: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.4; margin: 32px; max-width: 920px; }
      nav { display: flex; gap: 16px; margin-bottom: 24px; }
      form { display: grid; gap: 12px; margin: 20px 0; max-width: 360px; }
      input, button { font: inherit; padding: 8px; }
      table { border-collapse: collapse; margin-top: 16px; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      [data-testid="page-message"] { min-height: 24px; font-weight: 700; }
    </style>
  </head>
  <body>
    <nav>
      <a href="/customer">Customer</a>
      <a href="/risk">Risk</a>
    </nav>
    <h1>${escapeHtml(title)}</h1>
    <div data-testid="page-message">${escapeHtml(message)}</div>
    ${body}
  </body>
</html>`
}

function messageFromQuery(req: Request): string {
  const message = req.query.message
  return typeof message === 'string' ? message : ''
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie ?? ''
  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const trimmed = part.trim()
    if (!trimmed) {
      return cookies
    }
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      return cookies
    }
    cookies[trimmed.slice(0, separatorIndex)] = decodeURIComponent(trimmed.slice(separatorIndex + 1))
    return cookies
  }, {})
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
