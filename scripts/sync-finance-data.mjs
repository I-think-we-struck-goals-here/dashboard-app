import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const homeDir = process.env.HOME || ""
const REMOTE_SOURCE_TIMEOUT_MS = 30000

const SALES_METRICS = [
  "New Web Customers",
  "New customer revenue",
  "nAOV",
  "Website",
  "Amazon sales",
  "Google Ad Spend",
  "FB Ad Spend",
  "Amazon ad spend",
  "Total ad spend",
  "Total",
  "New Customer Aq Cost",
  "nROAS",
  "Net Profit (TW)",
  "AMAZON MER",
  "WEB MER",
  "TOTAL MER"
]

const DEFAULT_SALES_CANDIDATES = [
  process.env.FINANCE_SALES_SOURCE,
  path.join(homeDir, "Downloads", "Finances NOM - Weekly Sales (1)2.csv"),
  path.join(homeDir, "Downloads", "Finances NOM - Weekly Sales (1).csv"),
  path.join(homeDir, "Downloads", "Finances NOM - Weekly Sales.csv")
].filter(Boolean)

const DEFAULT_SUBS_CANDIDATES = [
  process.env.FINANCE_SUBSCRIPTIONS_SOURCE,
  path.join(homeDir, "Downloads", "active_subscriptions_2023-02-13-2026-02-15.csv"),
  path.join(homeDir, "Downloads", "active_subscriptions_2022-04-01-2025-06-30.csv")
].filter(Boolean)

const DEFAULT_OUTPUT = path.join(repoRoot, "src", "data", "weekly-performance.json")

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--sales") {
      out.sales = argv[i + 1]
      i += 1
    } else if (arg === "--subs") {
      out.subs = argv[i + 1]
      i += 1
    } else if (arg === "--out") {
      out.out = argv[i + 1]
      i += 1
    } else if (arg === "--help" || arg === "-h") {
      out.help = true
    }
  }
  return out
}

function printHelp() {
  console.log(`Usage: npm run sync:data -- [--sales <sales.csv>] [--subs <subs.csv>] [--out <file>]

Reads the weekly finance CSV exports and generates a JSON data file for the dashboard.

Defaults:
  sales: first existing file or URL from
    ${DEFAULT_SALES_CANDIDATES.join("\n    ")}
  subs: first existing file or URL from
    ${DEFAULT_SUBS_CANDIDATES.join("\n    ")}
  out: ${DEFAULT_OUTPUT}
`)
}

function isRemoteSource(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value)
}

function resolveSource(explicitSource, candidates, label) {
  if (explicitSource) {
    if (isRemoteSource(explicitSource)) {
      return explicitSource
    }

    const resolved = path.resolve(explicitSource)
    if (!fs.existsSync(resolved)) {
      throw new Error(`${label} file not found: ${resolved}`)
    }
    return resolved
  }

  const found = candidates.find((candidate) => isRemoteSource(candidate) || fs.existsSync(candidate))
  if (!found) {
    throw new Error(`No ${label} file found. Pass --${label} <path>.`)
  }
  return found
}

function loadSubscriptionsFromExistingOutput(outputPath) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(
      `No subscriptions source found and no existing output file is available at: ${outputPath}`
    )
  }

  const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"))
  if (!Array.isArray(existing.subscriptions)) {
    throw new Error(`Existing output file does not contain a subscriptions array: ${outputPath}`)
  }

  return existing.subscriptions
}

function describeSource(source) {
  if (!isRemoteSource(source)) {
    return path.basename(source)
  }

  const parsed = new URL(source)
  return `${parsed.origin}${parsed.pathname}`
}

async function readSourceText(source, label) {
  if (!isRemoteSource(source)) {
    return fs.readFileSync(source, "utf8")
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REMOTE_SOURCE_TIMEOUT_MS)

  try {
    const response = await fetch(source, {
      headers: {
        "user-agent": "dashboard-app-sync/1.0"
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${label} source: ${response.status} ${response.statusText}`)
    }

    return await response.text()
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timed out fetching ${label} source after ${REMOTE_SOURCE_TIMEOUT_MS}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (quoted) {
      if (char === "\"") {
        if (text[i + 1] === "\"") {
          cell += "\""
          i += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === "\"") {
      quoted = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (char !== "\r") {
      cell += char
    }
  }

  row.push(cell)
  rows.push(row)
  return rows
}

function parseNumeric(value) {
  if (value == null) return null
  const text = String(value).trim()
  if (!text || text === "#DIV/0!" || text === "NaN") return null

  const normalized = text.replace(/£/g, "").replace(/,/g, "").replace(/%/g, "")
  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

function parseSalesCsv(raw, sourceLabel) {
  const rows = parseCsv(raw.trim())
  const dateRowIndex = rows.findIndex((row) => row[0]?.trim() === "Date")
  if (dateRowIndex < 0) {
    throw new Error(`Could not find a Date header row in sales CSV: ${sourceLabel}`)
  }

  const dates = rows[dateRowIndex].slice(1).map((cell) => cell.trim())
  const metricMatrix = new Map()

  for (const row of rows.slice(dateRowIndex + 1)) {
    const label = row[0]?.trim()
    if (!label || !SALES_METRICS.includes(label)) continue
    metricMatrix.set(label, row.slice(1).map((cell) => parseNumeric(cell)))
  }

  const missingMetrics = SALES_METRICS.filter((metric) => !metricMatrix.has(metric))
  if (missingMetrics.length > 0) {
    throw new Error(`Sales CSV is missing required metrics: ${missingMetrics.join(", ")}`)
  }

  return dates
    .map((date, index) => {
      if (!date) return null
      const record = { date }
      for (const metric of SALES_METRICS) {
        record[metric] = metricMatrix.get(metric)[index] ?? null
      }
      return record
    })
    .filter(Boolean)
}

function parseSubscriptionsCsv(raw, sourceLabel) {
  const rows = parseCsv(raw.trim())
  const [header, ...body] = rows
  const headerIndex = new Map(header.map((name, index) => [name.trim(), index]))

  const dateIndex = headerIndex.get("date")
  const activeIndex = headerIndex.get("active_subscriptions")
  const netGainedIndex =
    headerIndex.get("net_gained_subscriptions") ?? headerIndex.get("net_gained")

  if (dateIndex == null || activeIndex == null || netGainedIndex == null) {
    throw new Error(`Subscriptions CSV is missing required columns in: ${sourceLabel}`)
  }

  return body
    .map((row) => {
      const date = row[dateIndex]?.trim()
      if (!date) return null
      return {
        date,
        active_subscriptions: parseNumeric(row[activeIndex]),
        net_gained: parseNumeric(row[netGainedIndex])
      }
    })
    .filter(Boolean)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const salesSource = resolveSource(args.sales, DEFAULT_SALES_CANDIDATES, "sales")
  const outputPath = path.resolve(args.out || DEFAULT_OUTPUT)
  const subscriptionsSource = args.subs
    ? resolveSource(args.subs, DEFAULT_SUBS_CANDIDATES, "subs")
    : DEFAULT_SUBS_CANDIDATES.find((candidate) => isRemoteSource(candidate) || fs.existsSync(candidate)) || null

  const salesSourceLabel = describeSource(salesSource)
  const sales = parseSalesCsv(await readSourceText(salesSource, "sales"), salesSourceLabel)
  const subscriptions = subscriptionsSource
    ? parseSubscriptionsCsv(
        await readSourceText(subscriptionsSource, "subscriptions"),
        describeSource(subscriptionsSource)
      )
    : loadSubscriptionsFromExistingOutput(outputPath)
  const subscriptionsSourceLabel = subscriptionsSource
    ? describeSource(subscriptionsSource)
    : `existing:${path.relative(repoRoot, outputPath)}`

  const payload = {
    generatedAt: new Date().toISOString(),
    salesSource: salesSourceLabel,
    subscriptionsSource: subscriptionsSourceLabel,
    sales,
    subscriptions
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + "\n")

  console.log(`Wrote ${sales.length} sales rows and ${subscriptions.length} subscription rows to ${outputPath}`)
  console.log(`Sales source: ${salesSourceLabel}`)
  console.log(`Subscriptions source: ${subscriptionsSourceLabel}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
