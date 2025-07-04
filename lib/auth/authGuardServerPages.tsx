import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./nextAuthOptions";
import {getUserData} from "@/lib/apis";
import { getLocale } from 'next-intl/server';

/**
 * Ensures that the current user is authenticated on the server side.
 * If not authenticated, it redirects the user to the specified path.
 *
 * This function should be called at the very beginning of an `async` Server Component
 * or a Server Action.
 *
 * @param redirectTo The path to redirect to if the user is not authenticated. Defaults to '/'.
 * @returns The session object if the user is authenticated.
 */

export async function requireAuthSSR(redirectTo: string = "/") {
  const session = await getServerSession(authOptions);
  const locale = await getLocale();

  if (!session) {
    redirect(redirectTo); // Server-side redirect
  }

  const {data:userData}= await getUserData(session, true)
   if(userData.learningProgress.length ===0){
     redirect(`/${locale}/onboarding`);
   }
  return session;
}

export async function getAuthSessionSSR() {
  const session = await getServerSession(authOptions);
  return session;
}
