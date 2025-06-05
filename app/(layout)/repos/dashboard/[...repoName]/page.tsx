import { auth } from "@/app/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitFork,
  Star,
  AlertCircle,
  Eye,
  GitPullRequest,
  CalendarDays,
  Clock,
  ExternalLink,
  Workflow,
  BookOpen,
  GitBranch,
  ShieldCheck,
  Archive,
  Users,
  Info,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserCard from "@/components/UserCard";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

async function fetchRepoDetails(owner: string, repo: string) {
  const session: any = await auth();
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=10`;
  const contributorsUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10&anon=false`;
  const workflowsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows`;

  try {
    const [repoResponse, prResponse, contributorsResponse, workflowsResponse] =
      await Promise.all([
        fetch(repoUrl, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          next: { revalidate: 60 * 5 },
        }),
        fetch(prUrl, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          next: { revalidate: 60 * 2 },
        }),
        fetch(contributorsUrl, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          next: { revalidate: 60 * 10 },
        }),
        fetch(workflowsUrl, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          next: { revalidate: 60 * 5 },
        }),
      ]);

    if (!repoResponse.ok)
      throw new Error(
        `Failed to fetch repo details: ${repoResponse.statusText} (${repoResponse.status})`
      );
    if (!prResponse.ok)
      throw new Error(
        `Failed to fetch pull requests: ${prResponse.statusText} (${prResponse.status})`
      );
    if (!contributorsResponse.ok)
      throw new Error(
        `Failed to fetch contributors: ${contributorsResponse.statusText} (${contributorsResponse.status})`
      );
    if (!workflowsResponse.ok)
      throw new Error(
        `Failed to fetch workflows: ${workflowsResponse.statusText} (${workflowsResponse.status})`
      );

    const repoDetails = await repoResponse.json();
    const pullRequests = await prResponse.json();
    const contributors = await contributorsResponse.json();
    const workflowsData = await workflowsResponse.json();

    let active_workflows_count = 0;
    if (
      workflowsData &&
      workflowsData.workflows &&
      Array.isArray(workflowsData.workflows)
    ) {
      active_workflows_count = workflowsData.workflows.filter(
        (wf: any) => wf.state === "active"
      ).length;
    }

    return { repoDetails, pullRequests, contributors, active_workflows_count };
  } catch (error) {
    console.error("Error fetching repository details:", error);
    return {
      repoDetails: null,
      pullRequests: [],
      contributors: [],
      active_workflows_count: 0,
    };
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelativeTime(dateString: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const getProgressValue = (value: number, maxReasonable: number) =>
  Math.min(100, (value / maxReasonable) * 100);

export default async function Page({
  params,
}: {
  params: Promise<{ repoName: string[] }>;
}) {
  const { repoName } = await params;
  if (!repoName || repoName.length < 2) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Invalid Repository Path</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The repository path is incorrect. Please check the URL.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [owner, repo] = repoName;
  const { repoDetails, pullRequests, contributors, active_workflows_count } =
    await fetchRepoDetails(owner, repo);

  if (!repoDetails) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Repository Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Could not fetch details for{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded">
                {owner}/{repo}
              </code>
              . The repository might be private, non-existent, or an error
              occurred.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricCardsData = [
    {
      name: "Stars",
      value: repoDetails.stargazers_count,
      icon: Star,
      bgColorFrom: "from-yellow-400",
      bgColorTo: "to-amber-500",
      textColor: "text-yellow-50",
      iconBgColor: "bg-yellow-500/80",
      iconTextColor: "text-white",
      link: `/stargazer/${owner}/${repo}?page=1`,
      buttonLabel: "View Stargazers",
      buttonClasses:
        "bg-yellow-50 text-amber-700 hover:bg-yellow-100 focus-visible:ring-amber-500",
    },
    {
      name: "Forks",
      value: repoDetails.forks_count,
      icon: GitFork,
      bgColorFrom: "from-blue-400",
      bgColorTo: "to-indigo-500",
      textColor: "text-blue-50",
      iconBgColor: "bg-blue-500/80",
      iconTextColor: "text-white",
      link: `/forks/${owner}/${repo}?page=1`,
      buttonLabel: "View Forks",
      buttonClasses:
        "bg-blue-50 text-indigo-700 hover:bg-blue-100 focus-visible:ring-indigo-500",
    },
    {
      name: "Workflows",
      value: active_workflows_count,
      icon: Workflow,
      bgColorFrom: "from-green-400",
      bgColorTo: "to-emerald-500",
      textColor: "text-green-50",
      iconBgColor: "bg-green-500/80",
      iconTextColor: "text-white",
      link: `/workflows/${owner}/${repo}`,
      buttonLabel: "View Workflows",
      buttonClasses:
        "bg-green-50 text-emerald-700 hover:bg-green-100 focus-visible:ring-emerald-500",
    },
    {
      name: "Open Issues",
      value: repoDetails.open_issues_count,
      icon: AlertCircle,
      bgColorFrom: "from-red-400",
      bgColorTo: "to-rose-500",
      textColor: "text-red-50",
      iconBgColor: "bg-red-500/80",
      iconTextColor: "text-white",
      link: repoDetails.html_url + "/issues",
      buttonLabel: "View Issues",
      external: true,
      buttonClasses:
        "bg-red-50 text-rose-700 hover:bg-red-100 focus-visible:ring-rose-500",
    },
  ];

  const progressStatsData = [
    {
      label: "Stars",
      value: repoDetails.stargazers_count,
      colorClass: "bg-yellow-500",
      max: Math.max(1000, repoDetails.stargazers_count * 1.2),
    },
    {
      label: "Forks",
      value: repoDetails.forks_count,
      colorClass: "bg-blue-500",
      max: Math.max(500, repoDetails.forks_count * 1.2),
    },
    {
      label: "Open Issues",
      value: repoDetails.open_issues_count,
      colorClass: "bg-red-500",
      max: Math.max(100, repoDetails.open_issues_count * 1.2),
    },
    {
      label: "Watchers",
      value: repoDetails.subscribers_count,
      colorClass: "bg-purple-500",
      max: Math.max(200, repoDetails.subscribers_count * 1.2),
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {repoDetails.owner?.avatar_url && (
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-border">
                <AvatarImage
                  src={repoDetails.owner.avatar_url}
                  alt={repoDetails.owner.login}
                />
                <AvatarFallback>
                  {repoDetails.owner.login.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {repoDetails.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                <Link
                  href={repoDetails.owner.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {repoDetails.owner.login}
                </Link>{" "}
                /{" "}
                <span className="font-medium text-foreground">
                  {repoDetails.name}
                </span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={repoDetails.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View on GitHub
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant={repoDetails.private ? "secondary" : "outline"}
            className="flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {repoDetails.private ? "Private" : "Public"}
          </Badge>
          {repoDetails.archived && (
            <Badge variant="destructive" className="flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5" /> Archived
            </Badge>
          )}
          {repoDetails.language && (
            <Badge variant="secondary">{repoDetails.language}</Badge>
          )}
          {repoDetails.license && (
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />{" "}
              {repoDetails.license.spdx_id || repoDetails.license.name}
            </Badge>
          )}
        </div>
      </header>

      {repoDetails.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {repoDetails.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCardsData.map((metric) => (
          <Card
            key={metric.name}
            className={`relative overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${metric.bgColorFrom} ${metric.bgColorTo} ${metric.textColor}`}
          >
            <div className="absolute -top-8 -right-8">
              <metric.icon
                className="h-28 w-28 opacity-10 text-white"
                strokeWidth={1.5}
              />
            </div>
            <CardContent className="relative z-10 p-6 flex flex-col justify-between h-full">
              <div>
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${metric.iconBgColor} ${metric.iconTextColor} shadow-md`}
                >
                  <metric.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium opacity-80">{metric.name}</p>
                <p className="mt-1 text-4xl font-bold tracking-tight">
                  {metric.value.toLocaleString()}
                </p>
              </div>
              {metric.link && (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className={`mt-5 w-full font-semibold shadow-sm transition-colors ${metric.buttonClasses}`}
                >
                  {metric.external ? (
                    <a
                      href={metric.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      {metric.buttonLabel}{" "}
                      <ExternalLink className="ml-1.5 h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={metric.link}
                      className="flex items-center justify-center"
                    >
                      {metric.buttonLabel}
                    </Link>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pulls">
            Pull Requests ({pullRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contributors">
            Contributors ({contributors?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repository Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Created
                </span>
                <span>{formatDate(repoDetails.created_at)}</span>
              </div>{" "}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Last Updated
                </span>
                <span>{formatDate(repoDetails.updated_at)}</span>
              </div>{" "}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Default Branch
                </span>
                <Badge variant="outline">{repoDetails.default_branch}</Badge>
              </div>{" "}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  License
                </span>
                <span>
                  {repoDetails.license ? repoDetails.license.name : "None"}
                </span>
              </div>{" "}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Watchers
                </span>
                <span>{repoDetails.subscribers_count.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Stats Visualized</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              {progressStatsData.map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-medium">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue(stat.value, stat.max)}
                    className={`h-2 [&>div]:${stat.colorClass}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pulls" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitPullRequest className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
                Open Pull Requests
              </CardTitle>
              <CardDescription>
                Showing the latest open pull requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pullRequests && pullRequests.length > 0 ? (
                <ul className="space-y-4">
                  {pullRequests.map((pr: any) => (
                    <li
                      key={pr.id}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4 p-4">
                        <Link
                          href={pr.user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage
                              src={pr.user.avatar_url}
                              alt={pr.user.login}
                            />
                            <AvatarFallback>
                              {pr.user.login.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <Link
                              href={pr.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-base hover:underline hover:text-primary line-clamp-2"
                              title={pr.title}
                            >
                              {pr.title}
                            </Link>
                            <Badge
                              variant="secondary"
                              className="whitespace-nowrap w-fit"
                            >
                              #{pr.number}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Opened {formatRelativeTime(pr.created_at)} by{" "}
                            <Link
                              href={pr.user.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline font-medium"
                            >
                              {pr.user.login}
                            </Link>
                          </p>
                          {pr.labels && pr.labels.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {pr.labels.slice(0, 3).map((label: any) => (
                                <Badge
                                  key={label.id}
                                  variant="outline"
                                  style={{
                                    borderColor: `#${label.color}`,
                                    color: `#${label.color}`,
                                  }}
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {label.name}
                                </Badge>
                              ))}
                              {pr.labels.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  +{pr.labels.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2" />
                  No open pull requests found for this repository.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" /> Top
                Contributors
              </CardTitle>
              <CardDescription>
                Showing up to 10 top contributors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contributors && contributors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {contributors
                    .filter((c: any) => c.type === "User")
                    .map((contributor: any) => (
                      <UserCard
                        key={contributor.id}
                        contributor={contributor}
                      />
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2" />
                  No contributor data available or repository is empty.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
