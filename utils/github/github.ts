import { auth } from "@/app/auth";
import { UserDetails } from "../../types/github/github";
import axios from "axios";
const BASE_URL = "https://api.github.com";

export const fetchUserDetails = async (
  username: string
): Promise<UserDetails> => {
  console.log(username);
  const session: any = await auth();
  if (!session) {
    throw new Error(`Failed to fetch user details: Please login again`);
  }
  try {
    const url = `${BASE_URL}/users/${username}`;
    console.log(url, " this is the url");
    const response = await axios.get<UserDetails>(
      `${BASE_URL}/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to fetch user details: ${error}`);
  }
};

export async function getStargazers(owner:string, repo:string, perPage = 30, page = 1) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${page}`,
    {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 60 }
    }
  );
  // console.log(await res.json(), " this is the get Stargazers");
  if (!res.ok) return [];
  return await res.json();
}