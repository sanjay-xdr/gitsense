import axios from "axios";
import { auth } from "../auth";
import RepoDropdown from "../../components/RepoDropDown";
import { Card, CardContent } from "@/components/ui/card";
import { SearchForm } from "@/components/search-form";

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
            Authorization: `token ${session?.accessToken}`,
          },
        }
      );

      console.log("Fetching Data");
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
  }

  return allRepos;
}

export default async function Dashboard() {
  const session: any = await auth();

  // Fetch all repositories
  const repos = await fetchAllRepos(session);
  console.log(repos.length);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your GitHub Repositories
      </h1>
      {repos.length > 0 ? (
        <RepoDropdown repos={repos} />
      ) : (
        <p className="text-center text-gray-500">No repositories found.</p>
      )}
  <h2 className="text-lg text-center mt-4">OR</h2>
      <div className="w-full max-w mt-8">
        <Card className="border-slate-200 bg-white/80 backdrop-blur-sm shadow-md">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">
              Enter a repository to explore:
            </p>
            <SearchForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
