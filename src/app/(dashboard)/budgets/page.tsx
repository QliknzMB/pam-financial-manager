import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BudgetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-2">
            Set and track your monthly spending budgets
          </p>
        </div>
        <Button>Create Budget</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No budgets created</CardTitle>
          <CardDescription>
            Create your first budget to start tracking your spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set monthly limits for categories like groceries, dining, entertainment, and more
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
