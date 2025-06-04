import axios from "axios";
import { auth } from "../../auth"; // Assuming this path is correct
import RepoDropdown from "../../../components/RepoDropDown"; // Assuming this path is correct
import { SearchForm } from "@/components/search-form"; // Assuming this path is correct
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Adjust path if needed
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Adjust path if needed
import { Github, ListTree, Search } from "lucide-react"; // Icons for visual appeal

// DO NOT CHANGE THIS FUNCTION as per instructions
async function fetchAllRepos(session: any) {
  const baseUrl = "https://api.github.com/user/repos";
  let page = 1;
  const perPage = 100;
  let allRepos: any[] = [];
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const { data } = await axios.get(
        `${baseUrl}?visibility=all&affiliation=owner,collaborator,organization_member&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `token ${session?.accessToken}`, // Ensure session.accessToken is correct
          },
        }
      );

      console.log("Fetching Data page:", page); // Kept console.log
      allRepos = [...allRepos, ...data];

      if (data.length < perPage) {
        hasMoreData = false;
      } else {
        page++;
      }
    }
  } catch (error: any) {
    console.error(
      "Error fetching repositories:",
      error.response?.status,
      error.response?.data || error.message
    );
    // Consider if you want to propagate this error to the UI
  }

  return allRepos;
}

export default async function Dashboard() {
  const session: any = await auth();

  // Fetch all repositories - DO NOT CHANGE
  const repos = await fetchAllRepos(session);
  console.log("Total repositories fetched:", repos.length); // Kept console.log

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center">
          <Github className="mr-3 h-10 w-10 text-primary" />
          Repository Dashboard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Select from your repositories or search to explore GitHub Actions.
        </p>
      </header>

      <div className="space-y-8">
        {/* Section 1: Your Repositories Dropdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <ListTree className="mr-3 h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Your Repositories</CardTitle>
            </div>
            <CardDescription>
              Choose one of your repositories to view its workflows and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {repos.length > 0 ? (
              <RepoDropdown repos={repos} />
            ) : (
              <Alert variant="default">
                <ListTree className="h-4 w-4" />
                <AlertTitle>No Repositories Found</AlertTitle>
                <AlertDescription>
                  We couldn't find any repositories associated with your GitHub account,
                  or there was an issue fetching them. You can try searching for a
                  public repository below.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* "OR" Separator */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">
              Or
            </span>
          </div>
        </div>

        {/* Section 2: Search Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center">
              <Search className="mr-3 h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Explore a Repository</CardTitle>
            </div>
            <CardDescription>
              Enter the full name of any public repository (e.g., <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">owner/repo-name</code>)
              to analyze its workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* The SearchForm component is used here as per original structure */}
            <SearchForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}