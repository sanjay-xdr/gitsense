import NextAuth, { Session } from "next-auth"
import GitHub from "next-auth/providers/github"



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub
    ({authorization:{
        params:{
            sscope:"read:user user:email repo"
        }
    }})
  ],
  callbacks: {
    async jwt({ token, account }) {
        console.log("JWT token ")
        console.log(account)
      if (account) {
        token.accessToken = account.access_token; // store access token
      }
      return token;
    },
    async session({ session, token }) {
        session.accessToken = token.accessToken; // expose access token to client
      return session;

    },
  },
})