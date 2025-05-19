import { auth } from "@/app/auth";
import { UserDetails } from "../../types/github/github";
import axios from "axios";
const BASE_URL = "https://api.github.com";

export const fetchUserDetails = async (
  username: string
): Promise<UserDetails> => {
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

export const getStargazers = async (
  owner: string,
  repo: string,
  perPage: number = 30,
  page: number = 1
) => {
  const session: any = await auth();

  let stargazers: any = [];
  let hasMore = true;
  const headers = {
    Authorization: `Bearer ${session.accessToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  while (hasMore) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${page}`,
      { headers }
    );
    if (!res.ok) break;
    const data = await res.json();
    stargazers = stargazers.concat(data);
    hasMore = data.length === perPage;
    page += 1;
  }
  return stargazers;
};
