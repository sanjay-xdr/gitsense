
import { auth } from "@/app/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitFork, Star, AlertCircle, Eye, GitPullRequest, Calendar, Clock, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { fetchUserDetails } from "@/utils/github/github"
import { UserDetails } from "@/types/github/github"
import UserCard from "@/components/UserCard"

async function fetchRepoDetails(owner: string, repo: string) {
  const session: any = await auth()
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`
  const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`
  const contributorsUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`

  try {
    const repoResponse = await fetch(repoUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    const repoDetails = await repoResponse.json()
    const prResponse = await fetch(prUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    const pullRequests = await prResponse.json()
    const contributorsResponse = await fetch(contributorsUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
    const contributors = await contributorsResponse.json()
    return { repoDetails, pullRequests, contributors }
  } catch (error) {
    console.error("Error fetching repository details:", error)
    return {
      repoDetails: null,
      pullRequests: [],
      contributors: [],
    }
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default async function Page({
  params
}: {
  params: { repoName: string[] }
}) {

  const { repoName } = await params
  const { repoDetails, pullRequests, contributors } = await fetchRepoDetails(
    repoName[0],
    repoName[1],
  )


  if (!repoDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Error fetching repository details. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{repoDetails.name}</h1>
            <Badge variant="outline" className="ml-2">
              {repoDetails.private ? "Private" : "Public"}
            </Badge>
            {repoDetails.archived && <Badge variant="secondary">Archived</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">{repoDetails.full_name}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={repoDetails.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* Description */}
      {repoDetails.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{repoDetails.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 via-white to-white shadow-lg border-0">
      <CardContent className="pt-7 pb-6 px-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full px-2 py-0.5 w-fit mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Stars
            </span>
            <span className="text-3xl font-bold text-gray-800 tracking-tight drop-shadow">
              {repoDetails.stargazers_count.toLocaleString()}
            </span>
          <Link href={`/stargazer/${repoName[0]}/${repoName[1]}?page=1`} >
            <Button
              variant="default"
              className="mt-3 w-fit bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold shadow-sm cursor-pointer"
              // onClick={onViewStargazers}
            >
              View Stargazers
            </Button>
          </Link>
          </div>
          <div className="rounded-full bg-yellow-100 p-4 flex items-center justify-center shadow-inner">
            <Star className="h-10 w-10 text-yellow-400 drop-shadow" />
          </div>
        </div>
      </CardContent>
    </Card>

      <Card className="bg-gradient-to-br from-blue-50 via-white to-white shadow-lg border-0">
      <CardContent className="pt-7 pb-6 px-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full px-2 py-0.5 w-fit mb-1">
              <GitFork className="h-4 w-4 text-blue-500" />
              Forks
            </span>
            <span className="text-3xl font-bold text-gray-800 tracking-tight drop-shadow">
              {repoDetails.forks_count.toLocaleString()}
            </span>
            <Link href={`/forks/${repoName[0]}/${repoName[1]}?page=1`}>
            <Button
              variant="default"
              className="mt-3 w-fit bg-blue-400 hover:bg-blue-300 text-blue-900 font-semibold shadow-sm cursor-pointer"
              // onClick={onViewForks}
            >
              View Forks
            </Button>
            </Link>
          </div>
          <div className="rounded-full bg-blue-100 p-4 flex items-center justify-center shadow-inner">
            <GitFork className="h-10 w-10 text-blue-400 drop-shadow" />
          </div>
        </div>
      </CardContent>
    </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold">{repoDetails.open_issues_count.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Watchers</p>
                <p className="text-2xl font-bold">{repoDetails.watchers_count.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pulls">Pull Requests</TabsTrigger>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Repository Info */}
          <Card>
            <CardHeader>
              <CardTitle>Repository Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span>{formatDate(repoDetails.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span>{formatDate(repoDetails.updated_at)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Default Branch:</span>
                    <span>{repoDetails.default_branch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">License:</span>
                    <span>{repoDetails.license ? repoDetails.license.name : "None"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repository Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Stars</span>
                    <span>{repoDetails.stargazers_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (repoDetails.stargazers_count / 1000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Forks</span>
                    <span>{repoDetails.forks_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-blue-400 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (repoDetails.forks_count / 500) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Issues</span>
                    <span>{repoDetails.open_issues_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-red-400 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (repoDetails.open_issues_count / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Watchers</span>
                    <span>{repoDetails.watchers_count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-purple-400 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (repoDetails.watchers_count / 500) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pulls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="h-5 w-5" />
                Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pullRequests.length > 0 ? (
                <div className="space-y-4">
                  {pullRequests.map((pr: any) => (
                    <div key={pr.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={pr.user.avatar_url || "/placeholder.svg?height=40&width=40"} alt={pr.user.login} />
                        <AvatarFallback>{pr.user.login.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {pr.title}
                          </a>
                          <Badge variant="outline">#{pr.number}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Opened by {pr.user.login}</span>
                          <span>•</span>
                          <span>{formatDate(pr.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No open pull requests.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributors.map((contributor: any) => (
                <UserCard key={contributor.id} contributor={contributor}/>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
