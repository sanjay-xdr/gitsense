"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnAuthenticated() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3); // Initialize countdown to 3 seconds

  useEffect(() => {
    // Start a timer to decrease the countdown every second
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect to /signin when countdown reaches 0
    if (countdown === 0) {
      router.push("/signin");
    }

    // Cleanup the timer when the component unmounts
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          You are not authenticated. Redirecting in {countdown}s or
        </h1>
        <button
          onClick={() => router.push("/signin")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login here
        </button>
      </div>
    </div>
  );
}