// import { SearchForm } from "@/components/search-form"
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardDescription,
//   CardTitle,
// } from "@/components/ui/card";
import { BackgroundFlare } from "@/components/background-flare";
import { GitHubIcon } from "@/components/github-icon";
import { FeatureCard } from "@/components/feature-card";
import Link from "next/link";


export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white text-slate-900">
      <BackgroundFlare />

      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitHubIcon className="h-8 w-8" />
            <span className="text-xl font-bold">GitSense</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4  flex flex-col items-center text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Visualize Your GitHub Repositories Like Never Before
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mb-10">
          GitSense transforms your GitHub data into beautiful, interactive
          dashboards. Gain deeper insights into your repositories, track
          activity, and make better decisions.
        </p>

        <div className="w-full max-w-md mb-16">
          <Link href={"/repos"}>
            <button className="px-6 py-3 text-white font-medium text-lg rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 cursor-pointer">
              Get Started 🚀
            </button>
          </Link>
        </div>
      </section>

      {/* <section
        id="get-started"
        className="container mx-auto px-4 py-20 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-700 mb-10">
            Enter any public GitHub repository and start exploring with GitSense
            today. No registration required.
          </p>

          <div className="w-full max-w-md mx-auto">
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm shadow-md">
              <CardContent className="pt-6">
                <SearchForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Powerful Features for Developers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="users"
            title="Contributor Analysis"
            description="Understand who's contributing to your projects and recognize top performers."
          />
          <FeatureCard
            icon="star"
            title="Stargazers Insights"
            description="See who starred your repository and view their profiles and activity details."
          />
          <FeatureCard
            icon="code"
            title="Forks Overview"
            description="Discover who forked your repo and explore detailed information about each fork."
          />
          <FeatureCard
            icon="pie-chart"
            title="Workflow Run Analytics"
            description="Visualize your GitHub Actions workflow runs and outcomes with interactive pie charts."
          />
          <FeatureCard
            icon="trending-up"
            title="Performance Tracking"
            description="Track repository growth, issue resolution rates, and overall project health."
          />
          <FeatureCard
            icon="zap"
            title="Instant Access"
            description="No installation required. Just enter a repository and start exploring."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <GitHubIcon className="h-6 w-6" />
            <span className="font-bold">GitSense</span>
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} GitSense. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
