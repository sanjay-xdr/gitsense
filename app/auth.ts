import NextAuth, { Session, DefaultSession, Account, NextAuthConfig } from "next-auth"
import { DefaultJWT } from "next-auth/jwt";
import GitHub from "next-auth/providers/github"

interface AccessToken {
  accessToken?:string
}
type SessionTypeUnion = DefaultSession & AccessToken;
type JwtUnion= DefaultJWT & AccessToken;



export const authOptions :NextAuthConfig={
    providers: [GitHub
      ({authorization:{
          params:{
              scope:"read:user user:email repo",
              prompt: "consent",
          }
      }})
    ],
    callbacks: {
      async jwt({ token, account }: { token: DefaultJWT; account?: Account | null }) {
        if (account) {
          token.accessToken = account.access_token; // store access token
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: DefaultJWT }) {
        (session as SessionTypeUnion).accessToken = (token as JwtUnion).accessToken; // expose access token to client
        // session.expires = "test";
        // You can add properties to session here if needed

        return session;
      },
    },
  }

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)