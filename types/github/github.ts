export interface UserDetails {
  login: string[];
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  notification_email?: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  following: number;
  created_at: string;
  updated_at: string;
  collaborators?: number;
}
