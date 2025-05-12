import NextAuth, { Session } from "next-auth"
import GitHub from "next-auth/providers/github"

export const authOptions={
    providers: [GitHub
      ({authorization:{
          params:{
              scope:"read:user user:email repo",
              prompt: "consent",
          }
      }})
    ],
    callbacks: {
      async jwt({ token, account }:any) {
          console.log("JWT token ")
          console.log(account)
        if (account) {
          token.accessToken = account.access_token; // store access token
        }
        return token;
      },
      async session({ session, token ,user}:any) {
          console.log(user)
          console.log(session)
          session.accessToken = token.accessToken; // expose access token to client
        return session;
  
      },
    },
  }

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)