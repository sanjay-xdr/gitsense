import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchUserDetails } from "@/utils/github/github";
import {
  Github,
  Mail,
  MapPin,
  Twitter,
  Briefcase,
  Globe,
  User,
} from "lucide-react";

export default async function UserCard({ contributor }: { contributor: any }) {
  console.log(contributor);
  const data = await fetchUserDetails(contributor.login);

  return (
    <Card className="overflow-hidden bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header with background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage
                src={
                  contributor.avatar_url ||
                  "/placeholder.svg?height=64&width=64"
                }
                alt={contributor.login}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                {contributor.login.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-slate-800">
                  {contributor.login}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {contributor.contributions} contributions
                </Badge>
              </div>

              {data.name && (
                <p className="text-slate-600 text-sm mt-1">
                  <User className="inline h-3.5 w-3.5 mr-1 opacity-70" />
                  {data.name}
                </p>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-slate-200"
                    asChild
                  >
                    <a
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View GitHub profile"
                    >
                      <Github className="h-4 w-4 text-slate-600" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View GitHub profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Bio section */}
        {data.bio && (
          <div className="px-6 py-3 border-b border-slate-100">
            <p className="text-slate-700 text-sm">{data.bio}</p>
          </div>
        )}

        {/* Details section */}
        <div className="p-6 space-y-3">
          {/* Location */}
          {data.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
              <span className="text-slate-700">{data.location}</span>
            </div>
          )}

          {/* Company */}
          {data.company && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
              <span className="text-slate-700">{data.company}</span>
            </div>
          )}

          {/* Twitter */}
          {data.twitter_username && (
            <div className="flex items-center text-sm">
              <Twitter className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
              <a
                href={`https://twitter.com/${data.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                @{data.twitter_username}
              </a>
            </div>
          )}

          {/* Blog */}
          {data.blog && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
              <a
                href={
                  data.blog.startsWith("http")
                    ? data.blog
                    : `https://${data.blog}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[250px]"
              >
                {data.blog}
              </a>
            </div>
          )}

          {/* Email */}
          {data.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
              <a
                href={`mailto:${data.email}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {data.email}
              </a>
            </div>
          )}

          {/* If no contact info is available */}
          {!data.location &&
            !data.company &&
            !data.twitter_username &&
            !data.blog &&
            !data.email && (
              <p className="text-slate-500 text-sm italic">
                No additional contact information available
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
