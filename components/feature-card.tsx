import { Card, CardContent } from "@/components/ui/card"
import { Activity, GitPullRequest, Users, Code, TrendingUp, Zap,Star,PieChart } from "lucide-react"

type FeatureIconType = "activity" | "git-pull-request" | "users" | "code" | "trending-up" | "zap" | "star"|"pie-chart"

interface FeatureCardProps {
  icon: FeatureIconType
  title: string
  description: string
}

const iconComponents = {
  activity: Activity,
  "git-pull-request": GitPullRequest,
  users: Users,
  code: Code,
  "trending-up": TrendingUp,
  zap: Zap,
  star:Star,
  "pie-chart":PieChart
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const IconComponent = iconComponents[icon]

  return (
    <Card className="border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
