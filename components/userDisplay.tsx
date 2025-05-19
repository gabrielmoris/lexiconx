// src/components/UserDisplay.tsx (or directly in a client page component)
"use client"; // Make sure this component is a client component

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function UserDisplay() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading user information...</p>;
  }
  console.log(session);
  if (status === "authenticated") {
    // Access user information through session.user
    return (
      <div>
        <h2>Welcome, {session.user?.name || session.user?.email}!</h2>
        {session.user?.image && (
          <Image
            width={50}
            height={50}
            src={session.user.image}
            alt={session.user?.name || "User Avatar"}
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        )}
        <p>Your email: {session.user?.email}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <p>You are not logged in.</p>;
  }

  return null; // Should not reach here
}
