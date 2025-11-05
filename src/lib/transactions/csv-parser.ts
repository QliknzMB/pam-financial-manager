import Papa from 'papaparse'
import { parseISO, parse, isValid } from 'date-fns'

export interface ParsedTransaction {
  date: Date
  description: string
  amount: number
  balance?: number
  reference?: string
  particulars?: string
  code?: string
  type?: 'debit' | 'credit'
}

export interface CSVParseResult {
  transactions: ParsedTransaction[]
  bank: string
  errors: string[]
}

// Date parsing helpers
function parseDate(dateString: string): Date | null {
  if (!dateString) return null

  // Try ISO format first (YYYY-MM-DD)
  try {
    const isoDate = parseISO(dateString)
    if (isValid(isoDate)) return isoDate
  } catch {
    // Continue to other formats
  }

  // Common date formats used by NZ banks
  const formats = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'dd/MM/yy',
    'dd-MM-yy',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
  ]

  for (const format of formats) {
    try {
      const parsed = parse(dateString, format, new Date())
      if (isValid(parsed)) return parsed
    } catch {
      continue
    }
  }

  return null
}

// Amount parsing helper
function parseAmount(amountString: string): number {
  if (!amountString) return 0

  // Remove currency symbols, commas, and whitespace
  const cleaned = amountString
    .replace(/[,$\s]/g, '')
    .replace(/[()]/g, '') // Remove parentheses sometimes used for negative
    .trim()

  const amount = parseFloat(cleaned)

  // Check if the original had parentheses (indicates negative)
  if (amountString.includes('(') && amountString.includes(')')) {
    return -Math.abs(amount)
  }

  return isNaN(amount) ? 0 : amount
}

// Detect bank from CSV headers
function detectBank(headers: string[]): string {
  const headerString = headers.join(',').toLowerCase()

  if (headerString.includes('anz') || (headers.includes('Type') && headers.includes('Details'))) {
    return 'ANZ'
  }
  if (headerString.includes('bnz') || headers.includes('Particulars')) {
    return 'BNZ'
  }
  if (headerString.includes('asb') || (headers.includes('Unique Id') && headers.includes('Tran Date'))) {
    return 'ASB'
  }
  if (headerString.includes('westpac')) {
    return 'Westpac'
  }
  if (headerString.includes('kiwibank')) {
    return 'Kiwibank'
  }

  return 'Unknown'
}

// Parse BNZ CSV format
function parseBNZ(row: any): ParsedTransaction | null {
  const date = parseDate(row['Date'] || row['date'])
  if (!date) return null

  const amount = parseAmount(row['Amount'] || row['amount'] || '0')

  return {
    date,
    description: row['Payee'] || row['payee'] || row['Description'] || '',
    amount,
    balance: parseAmount(row['Balance'] || row['balance'] || '0'),
    particulars: row['Particulars'] || row['particulars'] || '',
    reference: row['Reference'] || row['reference'] || '',
    code: row['Code'] || row['code'] || '',
  }
}

// Parse ANZ CSV format
function parseANZ(row: any): ParsedTransaction | null {
  const date = parseDate(row['Date'] || row['date'])
  if (!date) return null

  const amount = parseAmount(row['Amount'] || row['amount'] || '0')

  return {
    date,
    description: row['Details'] || row['details'] || row['Description'] || '',
    amount,
    balance: parseAmount(row['Balance'] || row['balance'] || '0'),
    type: row['Type']?.toLowerCase() === 'debit' ? 'debit' : 'credit',
    reference: row['Reference'] || row['reference'] || '',
  }
}

// Parse ASB CSV format
function parseASB(row: any): ParsedTransaction | null {
  const date = parseDate(row['Tran Date'] || row['Date'] || row['date'])
  if (!date) return null

  const amount = parseAmount(row['Amount'] || row['amount'] || '0')

  return {
    date,
    description: row['Transaction Description'] || row['Description'] || row['Payee'] || '',
    amount,
    balance: parseAmount(row['Balance'] || row['balance'] || '0'),
    reference: row['Reference'] || row['Unique Id'] || '',
  }
}

// Generic parser for unknown formats
function parseGeneric(row: any): ParsedTransaction | null {
  // Try to find date field
  const dateField = Object.keys(row).find((key) =>
    key.toLowerCase().includes('date')
  )
  if (!dateField) return null

  const date = parseDate(row[dateField])
  if (!date) return null

  // Try to find amount field
  const amountField = Object.keys(row).find((key) =>
    key.toLowerCase().includes('amount')
  )
  const amount = amountField ? parseAmount(row[amountField]) : 0

  // Try to find description field
  const descField = Object.keys(row).find((key) =>
    key.toLowerCase().includes('description') ||
    key.toLowerCase().includes('details') ||
    key.toLowerCase().includes('payee')
  )
  const description = descField ? row[descField] : ''

  // Try to find balance field
  const balanceField = Object.keys(row).find((key) =>
    key.toLowerCase().includes('balance')
  )
  const balance = balanceField ? parseAmount(row[balanceField]) : undefined

  return {
    date,
    description,
    amount,
    balance,
  }
}

// Main CSV parser
export async function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = []
    const transactions: ParsedTransaction[] = []
    let bank = 'Unknown'
    let headers: string[] = []

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        headers = results.meta.fields || []
        bank = detectBank(headers)

        results.data.forEach((row: any, index: number) => {
          try {
            let transaction: ParsedTransaction | null = null

            switch (bank) {
              case 'BNZ':
                transaction = parseBNZ(row)
                break
              case 'ANZ':
                transaction = parseANZ(row)
                break
              case 'ASB':
                transaction = parseASB(row)
                break
              default:
                transaction = parseGeneric(row)
            }

            if (transaction) {
              transactions.push(transaction)
            } else {
              errors.push(`Row ${index + 1}: Could not parse transaction`)
            }
          } catch (error) {
            errors.push(
              `Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          }
        })

        resolve({
          transactions,
          bank,
          errors,
        })
      },
      error: (error: Error) => {
        resolve({
          transactions: [],
          bank: 'Unknown',
          errors: [`Failed to parse CSV: ${error.message}`],
        })
      },
    })
  })
}
