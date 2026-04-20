import { useEffect, useMemo, useState } from "react"
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import weeklyPerformance from "./data/weekly-performance.json"

const { sales: RAW_SALES, subscriptions: RAW_SUBS } = weeklyPerformance
const SYNC_TRIGGER_URL =
  "https://script.google.com/macros/s/AKfycbzvK1JEtSJsQcattA9dySKpR9itwMlClmAt47PK8d4ecBatjASaMKTr71mZRmZFXmHRHw/exec"
const SYNC_POST_MESSAGE_SOURCE = "weekly-sales-graphics-sync"

const isTrustedSyncOrigin = (origin) =>
  /^https:\/\/([a-z0-9-]+\.)*google(?:usercontent)?\.com$/i.test(origin)

// Date helpers
const parseDate = (s) => {
  if (!s) return new Date(NaN)
  if (s.includes("/")) {
    const [dd, mm, yyyy] = s.split("/").map((x) => Number(x))
    return new Date(yyyy, mm - 1, dd)
  }
  const [yyyy, mm, dd] = s.split("-").map((x) => Number(x))
  return new Date(yyyy, mm - 1, dd)
}

const fmtDate = (s) => {
  const d = parseDate(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtNum = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(Number(n))
}

const fmtGBP = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Number(n))
}

const fmtPct = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return `${(Number(n) * 100).toFixed(1)}%`
}

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v)

// Theme
const THEME = {
  bg: "#f6f6f3",
  panel: "#ffffff",
  panel2: "#fbfbf8",
  text: "#0f172a",
  muted: "#475569",
  faint: "#94a3b8",
  border: "#e5e7eb",
  grid: "#eef2f7"
}

const SERIES_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0369a1",
  "#15803d",
  "#9333ea",
  "#c2410c",
  "#1f2937",
  "#0e7490",
  "#a16207",
  "#166534",
  "#9f1239",
  "#4f46e5",
  "#075985",
  "#7f1d1d",
  "#365314",
  "#1e3a8a",
  "#3f3f46",
  "#334155",
  "#6d28d9",
  "#047857"
]

// Formatting rules
const CURRENCY_KEYS = new Set([
  "New customer revenue",
  "nAOV",
  "Website Revenue",
  "Amazon sales",
  "Google Ad Spend",
  "FB Ad Spend",
  "Amazon ad spend",
  "Total ad spend",
  "Total",
  "New Customer Aq Cost",
  "Net Profit (TW)",
  "Ad Spend (Meta+Google)"
])

const PCT_KEYS = new Set(["AMAZON MER", "WEB MER", "TOTAL MER"])

const formatVal = (key, v) => {
  if (v == null) return "—"
  if (CURRENCY_KEYS.has(key)) return fmtGBP(v)
  if (PCT_KEYS.has(key)) return fmtPct(v)
  if (key === "nROAS") return Number(v).toFixed(2)
  if (key.includes("MER") || key.includes("ROAS") || key.includes("Efficiency")) return Number(v).toFixed(2)
  return fmtNum(v)
}

// Rolling average
const rollingAverage = (rows, keys, windowSize) => {
  const out = []
  for (let i = 0; i < rows.length; i += 1) {
    const start = Math.max(0, i - (windowSize - 1))
    const slice = rows.slice(start, i + 1)
    const next = { ...rows[i] }
    keys.forEach((k) => {
      let sum = 0
      let count = 0
      for (const r of slice) {
        const v = r[k]
        if (isFiniteNumber(v)) {
          sum += v
          count += 1
        }
      }
      next[k] = count ? sum / count : null
    })
    out.push(next)
  }
  return out
}

// Build base weekly rows
const salesData = RAW_SALES
  .map((r) => {
    const google = Number(r["Google Ad Spend"] || 0)
    const meta = Number(r["FB Ad Spend"] || 0)
    const metaGoogleSpend = google + meta

    return {
      ...r,
      "Website Revenue": r["Website"],
      "Ad Spend (Meta+Google)": metaGoogleSpend,
      _ts: parseDate(r.date).getTime(),
      _label: fmtDate(r.date)
    }
  })
  .sort((a, b) => a._ts - b._ts)

const subsData = RAW_SUBS
  .map((r) => ({
    ...r,
    _ts: parseDate(r.date).getTime(),
    _label: fmtDate(r.date)
  }))
  .sort((a, b) => a._ts - b._ts)

// Merge subs onto sales by nearest week within 7 days
const mergedData = salesData.map((s) => {
  const closest = subsData.reduce(
    (best, sub) => {
      const diff = Math.abs(sub._ts - s._ts)
      return diff < best.diff ? { diff, sub } : best
    },
    { diff: Infinity, sub: null }
  )

  const row = { ...s }
  if (closest.sub && closest.diff <= 7 * 86400000) {
    row["Active Subs"] = closest.sub.active_subscriptions
    row["Net Gained Subs"] = closest.sub.net_gained
  } else {
    row["Active Subs"] = null
    row["Net Gained Subs"] = null
  }

  const spend = row["Ad Spend (Meta+Google)"]
  const total = row["Total"]
  row["Efficiency (MER)"] = spend && isFiniteNumber(total) ? total / spend : null

  return row
})

const SALES_METRICS = [
  "New Web Customers",
  "New customer revenue",
  "nAOV",
  "Website Revenue",
  "Amazon sales",
  "Google Ad Spend",
  "FB Ad Spend",
  "Amazon ad spend",
  "Total ad spend",
  "Ad Spend (Meta+Google)",
  "Total",
  "New Customer Aq Cost",
  "nROAS",
  "Net Profit (TW)",
  "AMAZON MER",
  "WEB MER",
  "TOTAL MER",
  "Efficiency (MER)"
]

const SUB_METRICS = ["Active Subs", "Net Gained Subs"]
const ALL_METRICS = [...SALES_METRICS, ...SUB_METRICS]

const METRIC_COLORS = ALL_METRICS.reduce((acc, metric, idx) => {
  acc[metric] = SERIES_COLORS[idx % SERIES_COLORS.length]
  return acc
}, {})

const metricColor = (metric) => METRIC_COLORS[metric] || SERIES_COLORS[0]

const GROUPS = {
  Revenue: ["Website Revenue", "Amazon sales", "Total"],
  "New Customers": ["New Web Customers", "New customer revenue", "nAOV"],
  "Ad Spend": ["Google Ad Spend", "FB Ad Spend", "Ad Spend (Meta+Google)", "Amazon ad spend", "Total ad spend"],
  Efficiency: ["New Customer Aq Cost", "nROAS", "WEB MER", "TOTAL MER", "Efficiency (MER)"],
  Profit: ["Net Profit (TW)"],
  Subscriptions: ["Active Subs", "Net Gained Subs"]
}

const QUICK_VIEWS = [
  {
    label: "Core",
    metrics: ["Total", "Ad Spend (Meta+Google)", "New Web Customers", "New Customer Aq Cost", "Net Profit (TW)", "Active Subs"]
  },
  {
    label: "Revenue",
    metrics: ["Website Revenue", "Amazon sales", "Total", "Net Profit (TW)"]
  },
  {
    label: "Acquisition",
    metrics: ["New Web Customers", "Ad Spend (Meta+Google)", "New Customer Aq Cost", "nROAS", "Efficiency (MER)"]
  },
  {
    label: "Retention",
    metrics: ["Active Subs", "Net Gained Subs", "Total", "Net Profit (TW)"]
  }
]

const KPI_TREND_POLARITY = {
  "Ad Spend (Meta+Google)": "neutral",
  "New Customer Aq Cost": "down"
}

const metricKind = (k) => {
  if (PCT_KEYS.has(k)) return "pct"
  if (CURRENCY_KEYS.has(k)) return "gbp"
  if (k.includes("Subs") || k.includes("Customers")) return "count"
  if (k.includes("ROAS") || k.includes("MER") || k.includes("Efficiency")) return "ratio"
  return "count"
}

const defaultAxisFor = (k) => {
  const kind = metricKind(k)
  if (kind === "gbp") return "left"
  return "right"
}

const axisUnitLabel = (metrics, normalized = false) => {
  if (!metrics.length) return ""
  if (normalized) return "Index (100 baseline)"

  const kinds = new Set(metrics.map((m) => metricKind(m)))
  if (kinds.size === 1) {
    const only = [...kinds][0]
    if (only === "gbp") return "GBP (£)"
    if (only === "count") return "Count"
    if (only === "pct") return "Percent (%)"
    if (only === "ratio") return "Ratio"
  }

  const onlyRatios = [...kinds].every((k) => k === "ratio" || k === "pct")
  if (onlyRatios) return "Ratio / %"

  return "Mixed units"
}

const hasFiniteNonZero = (v) => Number.isFinite(v) && v !== 0

const metricMagnitude = (rows, key) => {
  const values = rows
    .map((row) => Number(row[key]))
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.abs(v))
    .filter((v) => v > 0)

  if (!values.length) return 0

  values.sort((a, b) => a - b)
  return values[Math.floor((values.length - 1) * 0.9)] || values[values.length - 1]
}

const axisPairForPreset = (rows, aKey, bKey) => {
  const magA = metricMagnitude(rows, aKey)
  const magB = metricMagnitude(rows, bKey)

  if (magA > 0 && magB > 0) {
    const ratio = Math.max(magA, magB) / Math.min(magA, magB)
    if (ratio >= 6) {
      return magA >= magB ? { axisA: "left", axisB: "right" } : { axisA: "right", axisB: "left" }
    }
  }

  const defaultA = defaultAxisFor(aKey)
  const defaultB = defaultAxisFor(bKey)

  if (defaultA !== defaultB) return { axisA: defaultA, axisB: defaultB }

  return { axisA: "left", axisB: "left" }
}

const buildAutoAxisMap = (rows, metrics) => {
  const next = {}
  metrics.forEach((metric) => {
    next[metric] = defaultAxisFor(metric)
  })

  const withMagnitude = metrics
    .map((metric) => ({ metric, magnitude: metricMagnitude(rows, metric) }))
    .filter((item) => item.magnitude > 0)

  if (withMagnitude.length < 2) return next

  const spread = Math.max(...withMagnitude.map((item) => Math.log10(item.magnitude))) - Math.min(...withMagnitude.map((item) => Math.log10(item.magnitude)))

  if (spread < 0.8) return next

  const sorted = [...withMagnitude].sort((a, b) => b.magnitude - a.magnitude)
  const splitAt = Math.ceil(sorted.length / 2)

  sorted.forEach((item, idx) => {
    next[item.metric] = idx < splitAt ? "left" : "right"
  })

  return next
}

const findNormalizationBaselineIndex = (rows, metrics, preferredBaseIndex = 0) => {
  if (!rows.length || !metrics.length) return 0

  const startAt = clamp(preferredBaseIndex, 0, rows.length - 1)
  const scoreRow = (row) =>
    metrics.reduce((score, metric) => {
      const v = Number(row?.[metric])
      return score + (hasFiniteNonZero(v) ? 1 : 0)
    }, 0)

  for (let i = startAt; i < rows.length; i += 1) {
    if (scoreRow(rows[i]) === metrics.length) return i
  }

  for (let i = 0; i < startAt; i += 1) {
    if (scoreRow(rows[i]) === metrics.length) return i
  }

  let bestIndex = startAt
  let bestScore = -1
  let bestDistance = Infinity

  for (let i = 0; i < rows.length; i += 1) {
    const score = scoreRow(rows[i])
    const distance = Math.abs(i - startAt)
    if (score > bestScore || (score === bestScore && distance < bestDistance)) {
      bestIndex = i
      bestScore = score
      bestDistance = distance
    }
  }

  return bestIndex
}

const buildNormalizedRows = (rows, metrics, preferredBaseIndex = 0) => {
  if (!rows.length || !metrics.length) return { rows, baseMap: {}, baselineIndex: 0 }

  const baselineIndex = findNormalizationBaselineIndex(rows, metrics, preferredBaseIndex)
  const baselineRow = rows[baselineIndex] || {}
  const baseMap = {}

  metrics.forEach((metric) => {
    const base = Number(baselineRow?.[metric])
    baseMap[metric] = hasFiniteNonZero(base) ? base : null
  })

  const normalizedRows = rows.map((row) => {
    const next = { ...row }
    metrics.forEach((metric) => {
      const current = Number(row?.[metric])
      const base = baseMap[metric]
      next[`__raw__${metric}`] = Number.isFinite(current) ? current : null

      if (!Number.isFinite(current) || !Number.isFinite(base) || base === 0) {
        next[metric] = null
      } else {
        next[metric] = (current / base) * 100
      }
    })
    return next
  })

  return { rows: normalizedRows, baseMap, baselineIndex }
}

const countMissingPoints = (rows, metrics) =>
  rows.reduce((total, row) => {
    let rowMissing = 0
    metrics.forEach((metric) => {
      const v = Number(row?.[metric])
      if (!Number.isFinite(v)) rowMissing += 1
    })
    return total + rowMissing
  }, 0)

const getKpiChangeDisplay = (key, change) => {
  if (change == null) return null

  const polarity = KPI_TREND_POLARITY[key] || "up"
  if (polarity === "neutral") {
    return {
      color: THEME.muted,
      text: `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(1)}% WoW`
    }
  }

  const good = polarity === "down" ? change < 0 : change >= 0
  return {
    color: good ? "#16a34a" : "#dc2626",
    text: `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% WoW`
  }
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const PresetMiniChart = ({ title, data, aKey, bKey, axisA, axisB }) => {
  const colorA = metricColor(aKey)
  const colorB = metricColor(bKey)
  const showRightAxis = axisA === "right" || axisB === "right"

  const tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div
        style={{
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          color: THEME.text,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.text }}>{label}</div>
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: THEME.muted }}>{p.dataKey}</span>
              <span style={{ fontWeight: 800, color: THEME.text }}>{formatVal(p.dataKey, p.value)}</span>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div
      style={{
        background: THEME.panel,
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: 14
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8, color: THEME.text }}>{title}</div>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: showRightAxis ? 26 : 10, left: 10, bottom: 8 }}>
            <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
            <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={56} interval="preserveStartEnd" />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: THEME.muted }} />
            {showRightAxis ? <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: THEME.muted }} /> : null}
            <Tooltip content={tooltip} />
            <Line yAxisId={axisA} type="monotone" dataKey={aKey} stroke={colorA} strokeWidth={2.4} dot={false} />
            <Line yAxisId={axisB} type="monotone" dataKey={bKey} stroke={colorB} strokeWidth={2.4} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: THEME.muted, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colorA, display: "inline-block" }} />
          {aKey}
        </span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colorB, display: "inline-block" }} />
          {bKey}
        </span>
      </div>
    </div>
  )
}

const formatAxisTick = (metric, value) => {
  if (!isFiniteNumber(value)) return ""
  const abs = Math.abs(value)
  const kind = metricKind(metric)

  if (kind === "gbp") {
    if (abs >= 1000) return `£${(value / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
    return `£${Math.round(value)}`
  }

  if (kind === "pct") return `${Math.round(value)}%`
  if (kind === "ratio") return Number(value).toFixed(abs >= 10 ? 0 : 1)
  if (abs >= 1000) return `${(value / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `${Math.round(value)}`
}

const LinkedSingleMetricChart = ({ title, data, metric, brushRange, onBrushChange }) => {
  const color = metricColor(metric)
  const showZeroLine = metric === "Net Profit (TW)"

  const tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div
        style={{
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          color: THEME.text,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.text }}>{label}</div>
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: THEME.muted }}>{p.dataKey}</span>
              <span style={{ fontWeight: 800, color: THEME.text }}>{formatVal(p.dataKey, p.value)}</span>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div
      style={{
        background: THEME.panel,
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)"
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8, color: THEME.text }}>{title}</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 18, left: 10, bottom: 8 }}>
            <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
            <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={56} interval="preserveStartEnd" />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: THEME.muted }}
              tickFormatter={(value) => formatAxisTick(metric, value)}
            />
            <Tooltip content={tooltip} />
            <Area yAxisId="left" type="monotone" dataKey={metric} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2.5} dot={false} />
            {showZeroLine ? <ReferenceLine yAxisId="left" y={0} stroke={THEME.border} strokeDasharray="4 4" /> : null}
            <Brush
              dataKey="_label"
              height={24}
              stroke={THEME.border}
              fill={THEME.panel2}
              travellerWidth={10}
              startIndex={brushRange.startIndex}
              endIndex={brushRange.endIndex}
              onChange={(r) => {
                if (!r) return
                const startIndex = r.startIndex ?? brushRange.startIndex
                const endIndex = r.endIndex ?? brushRange.endIndex
                onBrushChange({ startIndex, endIndex })
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [visible, setVisible] = useState(() => new Set(["Website Revenue", "Amazon sales", "Total", "Active Subs"]))
  const [chartType, setChartType] = useState("line")
  const [hoveredGroup, setHoveredGroup] = useState(null)
  const [syncState, setSyncState] = useState({
    status: "idle",
    message: "",
    actionsUrl: ""
  })

  const [useRolling, setUseRolling] = useState(false)
  const [windowSize, setWindowSize] = useState(4)
  const [normalizeMetrics, setNormalizeMetrics] = useState(false)

  const [axisMap, setAxisMap] = useState(() => {
    const m = {}
    ALL_METRICS.forEach((k) => {
      m[k] = defaultAxisFor(k)
    })
    return m
  })

  const [brushRange, setBrushRange] = useState(() => {
    const len = mergedData.length
    const startIndex = Math.max(0, len - 30)
    return { startIndex, endIndex: len - 1 }
  })

  const toggleMetric = (m) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  const toggleGroup = (g) => {
    const keys = GROUPS[g]
    const allOn = keys.every((k) => visible.has(k))
    setVisible((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => {
        if (allOn) next.delete(k)
        else next.add(k)
      })
      return next
    })
  }

  const displayedData = useMemo(() => {
    if (!useRolling) return mergedData
    return rollingAverage(mergedData, ALL_METRICS, windowSize)
  }, [useRolling, windowSize])

  useEffect(() => {
    setBrushRange((r) => {
      const len = displayedData.length
      const startIndex = clamp(r.startIndex, 0, Math.max(0, len - 1))
      const endIndex = clamp(r.endIndex, startIndex, Math.max(0, len - 1))
      return { startIndex, endIndex }
    })
  }, [displayedData.length])

  useEffect(() => {
    const handleSyncMessage = (event) => {
      if (!isTrustedSyncOrigin(event.origin)) return

      const payload = event.data
      if (!payload || payload.source !== SYNC_POST_MESSAGE_SOURCE) return

      setSyncState({
        status: payload.ok ? "started" : payload.status || "error",
        message: payload.message || (payload.ok ? "Sync started." : "Sync failed."),
        actionsUrl: payload.actionsUrl || ""
      })
    }

    window.addEventListener("message", handleSyncMessage)
    return () => window.removeEventListener("message", handleSyncMessage)
  }, [])

  const rangedData = useMemo(() => {
    const { startIndex, endIndex } = brushRange
    return displayedData.slice(startIndex, endIndex + 1)
  }, [displayedData, brushRange])

  const visibleMetrics = useMemo(() => ALL_METRICS.filter((m) => visible.has(m)), [visible])

  const leftMetrics = visibleMetrics.filter((m) => axisMap[m] === "left")
  const rightMetrics = visibleMetrics.filter((m) => axisMap[m] === "right")

  const normalized = useMemo(() => {
    if (!normalizeMetrics) return { rows: displayedData, baseMap: {}, baselineIndex: brushRange.startIndex }
    return buildNormalizedRows(displayedData, visibleMetrics, brushRange.startIndex)
  }, [normalizeMetrics, displayedData, visibleMetrics, brushRange.startIndex])

  const mainChartData = normalizeMetrics ? normalized.rows : displayedData
  const normalizedUnavailable = normalizeMetrics ? visibleMetrics.filter((m) => !Number.isFinite(normalized.baseMap[m])) : []
  const normalizationBaseLabel = displayedData[normalized.baselineIndex]?._label
  const missingPointCount = useMemo(() => countMissingPoints(rangedData, visibleMetrics), [rangedData, visibleMetrics])
  const leftAxisLabel = axisUnitLabel(normalizeMetrics ? visibleMetrics : leftMetrics, normalizeMetrics)
  const rightAxisLabel = normalizeMetrics ? "" : axisUnitLabel(rightMetrics, false)
  const canUseBarMode = visibleMetrics.length <= 3

  const autoBalanceAxes = () => {
    if (!visibleMetrics.length) return
    const next = buildAutoAxisMap(rangedData, visibleMetrics)
    setAxisMap((prevMap) => ({ ...prevMap, ...next }))
  }

  useEffect(() => {
    if (chartType === "bar" && !canUseBarMode) {
      setChartType("line")
    }
  }, [chartType, canUseBarMode])

  const latest = rangedData[rangedData.length - 1] || displayedData[displayedData.length - 1]
  const prev = rangedData[rangedData.length - 2] || displayedData[displayedData.length - 2]

  const wow = (curr, previous) => {
    if (curr == null || previous == null || previous === 0) return null
    return ((curr - previous) / Math.abs(previous)) * 100
  }

  const kpis = [
    { label: "Total revenue", key: "Total" },
    { label: "Website revenue", key: "Website Revenue" },
    { label: "Amazon", key: "Amazon sales" },
    { label: "Meta + Google spend", key: "Ad Spend (Meta+Google)" },
    { label: "New customers", key: "New Web Customers" },
    { label: "CAC", key: "New Customer Aq Cost" },
    { label: "Net profit", key: "Net Profit (TW)" },
    { label: "Active subs", key: "Active Subs" }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const hasNormalizedPayload = payload.some((p) => p?.payload && p.payload[`__raw__${p.dataKey}`] != null)
    return (
      <div
        style={{
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 12,
          color: THEME.text,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 8 }}>{label}</div>
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 18, padding: "2px 0" }}>
              <span style={{ color: THEME.muted }}>{p.dataKey}</span>
              <span style={{ fontWeight: 900 }}>
                {normalizeMetrics && hasNormalizedPayload
                  ? `${Number(p.value).toFixed(1)} index${Number.isFinite(Number(p.payload?.[`__raw__${p.dataKey}`])) ? ` · ${formatVal(p.dataKey, p.payload[`__raw__${p.dataKey}`])}` : ""}`
                  : formatVal(p.dataKey, p.value)}
              </span>
            </div>
          ))}
      </div>
    )
  }

  const axisSelect = (metric) => (
    <select
      value={axisMap[metric]}
      onChange={(e) => {
        const v = e.target.value
        setAxisMap((prevMap) => ({ ...prevMap, [metric]: v }))
      }}
      disabled={normalizeMetrics}
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: "7px 9px",
        fontSize: 12,
        background: THEME.panel,
        color: THEME.text,
        width: "100%",
        opacity: normalizeMetrics ? 0.55 : 1
      }}
    >
      <option value="left">Left axis</option>
      <option value="right">Right axis</option>
    </select>
  )

  const presets = useMemo(() => {
    const spend = "Ad Spend (Meta+Google)"
    const efficiency = "Efficiency (MER)"
    const list = [
      { title: "Ad spend vs CAC", aKey: spend, bKey: "New Customer Aq Cost" },
      { title: "Ad spend vs New customers", aKey: spend, bKey: "New Web Customers" },
      { title: "Ad spend vs Net profit", aKey: spend, bKey: "Net Profit (TW)" },
      { title: "Ad spend vs Efficiency", aKey: spend, bKey: efficiency }
    ]

    return list.map((p) => ({
      ...p,
      ...axisPairForPreset(rangedData, p.aKey, p.bKey)
    }))
  }, [rangedData])

  const subscriptionCharts = useMemo(() => {
    return [
      { title: "Total revenue", metric: "Total" },
      { title: "New customers", metric: "New Web Customers" },
      { title: "Meta + Google ad spend", metric: "Ad Spend (Meta+Google)" },
      { title: "WEB MER", metric: "WEB MER" },
      { title: "Profit", metric: "Net Profit (TW)" },
      { title: "Acquisition cost", metric: "New Customer Aq Cost" }
    ]
  }, [])

  const syncStatusColor =
    syncState.status === "started"
      ? "#166534"
      : syncState.status === "submitting"
        ? THEME.muted
        : syncState.status === "idle"
          ? THEME.muted
          : "#b91c1c"

  return (
    <div
      style={{
        background: THEME.bg,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        padding: "22px 22px 40px"
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-0.02em" }}>Weekly Performance Dashboard</div>
              <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>
                {fmtDate(salesData[0].date)} to {fmtDate(salesData[salesData.length - 1].date)} · {salesData.length} weeks
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <form
                method="post"
                action={SYNC_TRIGGER_URL}
                target="dashboard-sync-trigger-frame"
                onSubmit={() =>
                  setSyncState({
                    status: "submitting",
                    message: "Starting sync. GitHub will refresh the dashboard in about 1 to 2 minutes.",
                    actionsUrl: "https://github.com/I-think-we-struck-goals-here/dashboard-app/actions/workflows/sync-dashboard-data.yml"
                  })
                }
                style={{ margin: 0 }}
              >
                <input type="hidden" name="action" value="trigger-sync" />
                <button
                  type="submit"
                  style={{
                    border: "1px solid #0f172a",
                    background: "#0f172a",
                    color: "#f6f6f3",
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer"
                  }}
                >
                  Sync Data
                </button>
              </form>

              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13, color: THEME.muted }}>
                <input type="checkbox" checked={useRolling} onChange={(e) => setUseRolling(e.target.checked)} />
                4 week rolling average
              </label>

              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13, color: THEME.muted }}>
                <input type="checkbox" checked={normalizeMetrics} onChange={(e) => setNormalizeMetrics(e.target.checked)} />
                Normalize metrics (index = 100)
              </label>

              <select
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                disabled={!useRolling}
                style={{
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontSize: 13,
                  background: THEME.panel,
                  color: THEME.text,
                  opacity: useRolling ? 1 : 0.5
                }}
              >
                <option value={4}>4 weeks</option>
                <option value={6}>6 weeks</option>
                <option value={8}>8 weeks</option>
              </select>
            </div>
          </div>

          <iframe
            name="dashboard-sync-trigger-frame"
            title="Dashboard sync trigger"
            style={{ display: "none" }}
          />

          {syncState.message ? (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${THEME.border}`,
                background: THEME.panel,
                color: syncStatusColor,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                fontSize: 13,
                fontWeight: 800
              }}
            >
              <span>{syncState.message}</span>
              {syncState.actionsUrl ? (
                <a
                  href={syncState.actionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: THEME.text, fontWeight: 900 }}
                >
                  View workflow
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
          {kpis.map((k) => {
            const val = latest?.[k.key]
            const change = wow(val, prev?.[k.key])
            const changeDisplay = getKpiChangeDisplay(k.key, change)
            return (
              <div
                key={k.key}
                style={{
                  background: THEME.panel,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 18,
                  padding: "14px 14px",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)"
                }}
              >
                <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 950, marginTop: 6 }}>{formatVal(k.key, val)}</div>
                {changeDisplay ? (
                  <div style={{ fontSize: 12, marginTop: 6, color: changeDisplay.color, fontWeight: 900 }}>{changeDisplay.text}</div>
                ) : (
                  <div style={{ fontSize: 12, marginTop: 6, color: THEME.faint }}> </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ fontWeight: 950 }}>Metric groups</div>
              <button
                onClick={() => setVisible(new Set())}
                style={{
                  border: `1px solid ${THEME.border}`,
                  background: THEME.panel2,
                  borderRadius: 12,
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: THEME.muted,
                  fontWeight: 900
                }}
              >
                Clear
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Quick Views
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {QUICK_VIEWS.map((view) => {
                  const active = visible.size === view.metrics.length && view.metrics.every((metric) => visible.has(metric))
                  return (
                    <button
                      key={view.label}
                      onClick={() => setVisible(new Set(view.metrics))}
                      style={{
                        border: `1px solid ${THEME.border}`,
                        background: active ? THEME.text : THEME.panel2,
                        borderRadius: 999,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                        color: active ? THEME.bg : THEME.text,
                        fontWeight: 900
                      }}
                    >
                      {view.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(GROUPS).map((g) => {
                const keys = GROUPS[g]
                const allOn = keys.every((k) => visible.has(k))
                const someOn = keys.some((k) => visible.has(k))
                return (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    onMouseEnter={() => setHoveredGroup(g)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      background: allOn ? THEME.text : someOn ? THEME.panel2 : THEME.panel,
                      borderRadius: 999,
                      padding: "7px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: allOn ? THEME.bg : THEME.text,
                      fontWeight: 950
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>

            {hoveredGroup ? (
              <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>{GROUPS[hoveredGroup].join(" · ")}</div>
            ) : null}

            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ALL_METRICS.map((m) => {
                const on = visible.has(m)
                const c = metricColor(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMetric(m)}
                    style={{
                      border: `1px solid ${on ? c : THEME.border}`,
                      background: on ? `${c}14` : "transparent",
                      borderRadius: 12,
                      padding: "6px 9px",
                      cursor: "pointer",
                      fontSize: 12,
                      color: on ? THEME.text : THEME.muted,
                      fontWeight: 900
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 950 }}>Active series</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["line", "bar", "area"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (t === "bar" && !canUseBarMode) return
                      setChartType(t)
                    }}
                    disabled={t === "bar" && !canUseBarMode}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      background: chartType === t ? THEME.text : THEME.panel2,
                      borderRadius: 12,
                      padding: "7px 10px",
                      cursor: t === "bar" && !canUseBarMode ? "not-allowed" : "pointer",
                      fontSize: 13,
                      color: chartType === t ? THEME.bg : THEME.text,
                      fontWeight: 950,
                      textTransform: "capitalize",
                      opacity: t === "bar" && !canUseBarMode ? 0.45 : 1
                    }}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={autoBalanceAxes}
                  disabled={normalizeMetrics || !visibleMetrics.length}
                  style={{
                    border: `1px solid ${THEME.border}`,
                    background: THEME.panel2,
                    borderRadius: 12,
                    padding: "7px 10px",
                    cursor: normalizeMetrics || !visibleMetrics.length ? "not-allowed" : "pointer",
                    fontSize: 13,
                    color: THEME.text,
                    fontWeight: 900,
                    opacity: normalizeMetrics || !visibleMetrics.length ? 0.55 : 1
                  }}
                >
                  Auto-balance axes
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {visibleMetrics.length ? (
                visibleMetrics.map((m) => {
                  const c = metricColor(m)
                  return (
                    <div key={m} style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 10, alignItems: "center" }}>
                      <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />
                        <div style={{ fontSize: 13, fontWeight: 950 }}>{m}</div>
                      </div>
                      {axisSelect(m)}
                    </div>
                  )
                })
              ) : (
                <div style={{ fontSize: 13, color: THEME.muted }}>Select metrics to plot</div>
              )}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted }}>
              {normalizeMetrics ? "Normalization is on, so all active metrics share one index scale." : "Tip: put currency on the left axis and counts or ratios on the right axis"}
            </div>
            {!canUseBarMode ? <div style={{ marginTop: 6, fontSize: 12, color: THEME.muted }}>Bar mode is limited to 3 active metrics for readability.</div> : null}
          </div>
        </div>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8 }}>Time series</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11, color: THEME.muted, marginBottom: 8 }}>
            <span style={{ background: THEME.panel2, border: `1px solid ${THEME.border}`, borderRadius: 999, padding: "3px 8px" }}>
              Left axis: {leftAxisLabel || "—"}
            </span>
            {!normalizeMetrics && rightMetrics.length ? (
              <span style={{ background: THEME.panel2, border: `1px solid ${THEME.border}`, borderRadius: 999, padding: "3px 8px" }}>
                Right axis: {rightAxisLabel || "—"}
              </span>
            ) : null}
          </div>

          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <ComposedChart data={mainChartData} margin={{ top: 8, right: 46, left: 10, bottom: 8 }}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={70} interval="preserveStartEnd" />

                {visibleMetrics.length ? (
                  <YAxis
                    yAxisId="left"
                    label={
                      leftAxisLabel
                        ? { value: leftAxisLabel, angle: -90, position: "insideLeft", offset: 2, fill: THEME.muted, fontSize: 11 }
                        : undefined
                    }
                    tick={{ fontSize: 11, fill: THEME.muted }}
                    tickFormatter={(v) => {
                      if (!isFiniteNumber(v)) return ""
                      if (normalizeMetrics) return `${Math.round(v)}`
                      if (v >= 1000) return `£${(v / 1000).toFixed(0)}k`
                      return v
                    }}
                  />
                ) : null}

                {!normalizeMetrics && rightMetrics.length ? (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={
                      rightAxisLabel
                        ? { value: rightAxisLabel, angle: 90, position: "insideRight", offset: 2, fill: THEME.muted, fontSize: 11 }
                        : undefined
                    }
                    tick={{ fontSize: 11, fill: THEME.muted }}
                  />
                ) : null}

                <Tooltip content={CustomTooltip} />

                {visibleMetrics.map((m) => {
                  const color = metricColor(m)
                  const yId = normalizeMetrics ? "left" : axisMap[m] || "left"

                  if (chartType === "bar") return <Bar key={m} yAxisId={yId} dataKey={m} fill={color} fillOpacity={0.6} />

                  if (chartType === "area")
                    return (
                      <Area key={m} yAxisId={yId} type="monotone" dataKey={m} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} dot={false} />
                    )

                  return <Line key={m} yAxisId={yId} type="monotone" dataKey={m} stroke={color} strokeWidth={2.5} dot={false} />
                })}

                {normalizeMetrics ? <ReferenceLine yAxisId="left" y={100} stroke={THEME.border} strokeDasharray="4 4" /> : null}

                <Brush
                  dataKey="_label"
                  height={28}
                  stroke={THEME.border}
                  fill={THEME.panel2}
                  travellerWidth={10}
                  startIndex={brushRange.startIndex}
                  endIndex={brushRange.endIndex}
                  onChange={(r) => {
                    if (!r) return
                    const startIndex = r.startIndex ?? brushRange.startIndex
                    const endIndex = r.endIndex ?? brushRange.endIndex
                    setBrushRange({ startIndex, endIndex })
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>
            {normalizeMetrics
              ? `Normalized to index 100 from ${normalizationBaseLabel || "the selected baseline week"} (same baseline for all active metrics).`
              : "Date range stays fixed when you change metrics"}
            {normalizeMetrics && normalizedUnavailable.length
              ? ` ${normalizedUnavailable.length} metric${normalizedUnavailable.length > 1 ? "s are" : " is"} hidden because no non-zero baseline was found.`
              : ""}
            {!normalizeMetrics && missingPointCount ? ` ${missingPointCount} missing data point${missingPointCount > 1 ? "s are" : " is"} shown as line breaks.` : ""}
          </div>
        </div>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8 }}>Subscriptions</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <ComposedChart data={displayedData} margin={{ top: 8, right: 46, left: 10, bottom: 8 }}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={80} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: THEME.muted }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: THEME.muted }} />
                <Tooltip content={CustomTooltip} />
                <Area yAxisId="left" type="monotone" dataKey="Active Subs" stroke={metricColor("Active Subs")} fill={metricColor("Active Subs")} fillOpacity={0.12} strokeWidth={2.5} dot={false} />
                <Bar yAxisId="right" dataKey="Net Gained Subs" fill={metricColor("Net Gained Subs")} fillOpacity={0.55} />
                <ReferenceLine yAxisId="right" y={0} stroke={THEME.border} strokeDasharray="4 4" />
                <Brush
                  dataKey="_label"
                  height={24}
                  stroke={THEME.border}
                  fill={THEME.panel2}
                  travellerWidth={10}
                  startIndex={brushRange.startIndex}
                  endIndex={brushRange.endIndex}
                  onChange={(r) => {
                    if (!r) return
                    const startIndex = r.startIndex ?? brushRange.startIndex
                    const endIndex = r.endIndex ?? brushRange.endIndex
                    setBrushRange({ startIndex, endIndex })
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {subscriptionCharts.map((chart) => (
              <LinkedSingleMetricChart
                key={chart.title}
                title={chart.title}
                data={displayedData}
                metric={chart.metric}
                brushRange={brushRange}
                onBrushChange={setBrushRange}
              />
            ))}
          </div>
        </div>

        <details style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 950, fontSize: 14 }}>
            Preset charts <span style={{ fontWeight: 700, fontSize: 12, color: THEME.muted, marginLeft: 10 }}>Click to show</span>
          </summary>

          <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted }}>All Ad spend presets use Meta + Google only</div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {presets.map((p) => (
              <PresetMiniChart key={p.title} title={p.title} data={rangedData} aKey={p.aKey} bKey={p.bKey} axisA={p.axisA} axisB={p.axisB} />
            ))}
          </div>
        </details>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ padding: "14px 14px 10px", fontWeight: 950 }}>Last 12 weeks (within selected range)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, background: THEME.panel2 }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", color: THEME.muted, fontWeight: 950, position: "sticky", left: 0, background: THEME.panel2 }}>
                    Week
                  </th>
                  {["Total", "Website Revenue", "Amazon sales", "New Web Customers", "Ad Spend (Meta+Google)", "Net Profit (TW)", "nROAS", "Active Subs"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "right", color: THEME.muted, fontWeight: 950, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rangedData
                  .slice(-12)
                  .reverse()
                  .map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: "9px 12px", textAlign: "left", color: THEME.text, fontWeight: 950, position: "sticky", left: 0, background: THEME.panel }}>
                        {row._label}
                      </td>
                      {["Total", "Website Revenue", "Amazon sales", "New Web Customers", "Ad Spend (Meta+Google)", "Net Profit (TW)", "nROAS", "Active Subs"].map((k) => (
                        <td key={k} style={{ padding: "9px 12px", textAlign: "right", color: THEME.text, fontVariantNumeric: "tabular-nums", fontWeight: 850 }}>
                          {formatVal(k, row[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
