"use server";

import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export async function createSession(idToken: string) {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    cookies().set("firebase-session", idToken, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
      sameSite: "lax",
      path: "/",
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new Error("Could not create session.");
  }
}

export async function clearSession() {
  try {
    cookies().delete("firebase-session");
  } catch (error) {
    console.error("Failed to clear session:", error);
    throw new Error("Could not clear session.");
  }
  redirect('/login');
}
