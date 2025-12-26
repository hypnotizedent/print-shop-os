/**
 * Reports Page
 *
 * Displays executive summary, revenue metrics, and top customers.
 * Uses authenticated /api/reports/* endpoints.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useReportSummary,
  useTopCustomers,
  useProductionStats,
  type TopCustomer
} from '@/lib/hooks'
import {
  ChartLine,
  CurrencyDollar,
  Package,
  Users,
  Clock,
  CheckCircle,
  Hourglass,
  ArrowClockwise,
  Warning,
  TrendUp,
  Receipt
} from '@phosphor-icons/react'

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// =============================================================================
// Stat Card Component
// =============================================================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  color?: string
}

function StatCard({ title, value, icon, description, color = 'text-foreground' }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Status Row Component
// =============================================================================

interface StatusRowProps {
  label: string
  count: number
  total: number
  color: string
}

function StatusRow({ label, count, total, color }: StatusRowProps) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{formatNumber(count)}</span>
        <span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
      </div>
    </div>
  )
}

// =============================================================================
// Top Customers Table
// =============================================================================

function TopCustomersTable({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No customer data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Customer</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Orders</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Revenue</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Avg Order</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, idx) => (
            <tr key={customer.id} className="border-b border-border/50 last:border-0">
              <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    {customer.company && (
                      <div className="text-xs text-muted-foreground">{customer.company}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="text-right py-2 px-2">{customer.order_count}</td>
              <td className="text-right py-2 px-2 font-medium text-green-400">
                {formatCurrency(customer.total_spent)}
              </td>
              <td className="text-right py-2 px-2 text-muted-foreground">
                {formatCurrency(customer.avg_order)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// Main Reports Page
// =============================================================================

export default function ReportsPage() {
  // Fetch authenticated report data
  const { summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useReportSummary()
  const { customers: topCustomers, loading: customersLoading, error: customersError, refetch: refetchCustomers } = useTopCustomers({ limit: 10 })

  // Also fetch production stats (unauthenticated) for status breakdown
  const { stats: productionStats, loading: statsLoading } = useProductionStats()

  const isLoading = summaryLoading || customersLoading || statsLoading

  // Calculate production metrics from production stats
  const totalOrders = productionStats?.total || 0
  const inProduction = (productionStats?.screenprint || 0) +
                       (productionStats?.embroidery || 0) +
                       (productionStats?.dtg || 0)
  const pendingOrders = (productionStats?.quote || 0) +
                        (productionStats?.art || 0) +
                        (productionStats?.fulfillment || 0)
  const completedOrders = productionStats?.complete || 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ChartLine weight="bold" className="w-5 h-5" />
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Executive summary and analytics
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchSummary(); refetchCustomers(); }}>
          <ArrowClockwise weight="bold" className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading reports...
        </div>
      ) : (
        <>
          {/* Revenue Summary Cards */}
          {summaryError ? (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <Warning weight="bold" className="w-8 h-8 mx-auto text-destructive mb-2" />
                <p className="text-sm text-muted-foreground mb-4">{summaryError.message}</p>
                <Button variant="outline" size="sm" onClick={refetchSummary}>
                  <ArrowClockwise weight="bold" className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(summary.total_revenue)}
                icon={<CurrencyDollar weight="bold" className="w-6 h-6" />}
                description="All completed orders"
                color="text-green-400"
              />
              <StatCard
                title="Collected"
                value={formatCurrency(summary.total_collected)}
                icon={<Receipt weight="bold" className="w-6 h-6" />}
                description="Payments received"
                color="text-blue-400"
              />
              <StatCard
                title="Outstanding"
                value={formatCurrency(summary.total_outstanding)}
                icon={<Hourglass weight="bold" className="w-6 h-6" />}
                description="Pending payment"
                color="text-yellow-400"
              />
              <StatCard
                title="Avg Order Value"
                value={formatCurrency(summary.avg_order_value)}
                icon={<TrendUp weight="bold" className="w-6 h-6" />}
                description="Per order average"
              />
            </div>
          )}

          {/* Order Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="Total Orders"
                value={formatNumber(summary.total_orders)}
                icon={<Package weight="bold" className="w-6 h-6" />}
                description="All time"
              />
              <StatCard
                title="Active Jobs"
                value={formatNumber(summary.active_jobs)}
                icon={<Clock weight="bold" className="w-6 h-6" />}
                description="In progress"
                color="text-blue-400"
              />
              <StatCard
                title="Quotes"
                value={formatNumber(summary.quotes)}
                icon={<Users weight="bold" className="w-6 h-6" />}
                description="Pending conversion"
              />
              <StatCard
                title="Completed"
                value={formatNumber(summary.completed)}
                icon={<CheckCircle weight="bold" className="w-6 h-6" />}
                description="Fulfilled orders"
                color="text-green-400"
              />
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Production Status Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock weight="bold" className="w-4 h-4" />
                  Order Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <StatusRow
                  label="Quotes"
                  count={productionStats?.quote || 0}
                  total={totalOrders}
                  color="bg-gray-400"
                />
                <StatusRow
                  label="Art Approval"
                  count={productionStats?.art || 0}
                  total={totalOrders}
                  color="bg-purple-400"
                />
                <StatusRow
                  label="Screen Print"
                  count={productionStats?.screenprint || 0}
                  total={totalOrders}
                  color="bg-emerald-400"
                />
                <StatusRow
                  label="Embroidery"
                  count={productionStats?.embroidery || 0}
                  total={totalOrders}
                  color="bg-blue-400"
                />
                <StatusRow
                  label="DTG"
                  count={productionStats?.dtg || 0}
                  total={totalOrders}
                  color="bg-orange-400"
                />
                <StatusRow
                  label="Fulfillment"
                  count={productionStats?.fulfillment || 0}
                  total={totalOrders}
                  color="bg-yellow-400"
                />
                <StatusRow
                  label="Complete"
                  count={productionStats?.complete || 0}
                  total={totalOrders}
                  color="bg-green-400"
                />
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users weight="bold" className="w-4 h-4" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {customersError ? (
                  <div className="text-center py-4">
                    <Warning weight="bold" className="w-6 h-6 mx-auto text-destructive mb-2" />
                    <p className="text-xs text-muted-foreground">{customersError.message}</p>
                    <Button variant="ghost" size="sm" onClick={refetchCustomers} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <TopCustomersTable customers={topCustomers} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics */}
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendUp weight="bold" className="w-4 h-4" />
                Quick Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Orders</p>
                  <p className="text-xl font-semibold mt-1">
                    {formatNumber(totalOrders - completedOrders)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Orders not yet complete
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Production</p>
                  <p className="text-xl font-semibold mt-1 text-yellow-400">
                    {formatNumber(pendingOrders)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quotes + Art + Fulfillment
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">In Production</p>
                  <p className="text-xl font-semibold mt-1 text-blue-400">
                    {formatNumber(inProduction)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Screen Print + EMB + DTG
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Completion Rate</p>
                  <p className="text-xl font-semibold mt-1 text-green-400">
                    {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0'}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(completedOrders)} completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
