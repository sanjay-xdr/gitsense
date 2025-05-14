"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { useRouter } from 'next/navigation';

// import { sign } from "crypto";

export default function Signin() {
        const router = useRouter();

  return (
    <div className="flex justify-center items-center w-screen h-screen ">
      <Button className="cursor-pointer w-100 h-20" size="lg">
        <Github height={50} width={50} />
        <p
          className="text-xl
"
          onClick={()=>{
            signIn("github")
            router.push("/")
          }}
        >
          Login with Github
        </p>
      </Button>
    </div>
  );
}
