import { auth } from "@/app/auth";
import {UserDetails} from "../../types/github/github"
import axios from "axios"
const BASE_URL="https://api.github.com";

export const fetchUserDetails = async (username: string): Promise<UserDetails> => {
    const session:any=await auth();
    if(!session){
     throw new Error(`Failed to fetch user details: Please login again`);
    }
  try {
    const url=`${BASE_URL}/users/${username}`;
    console.log(url ," this is the url");
    const response = await axios.get<UserDetails>(`${BASE_URL}/users/${username}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to fetch user details: ${error}`);
  }
};