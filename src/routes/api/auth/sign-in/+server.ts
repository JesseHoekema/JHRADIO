import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { email, password } = await request.json();

    if (!email || !password) {
        return json({ message: "Email and password are required" }, { status: 400 });
    }

    try {
        // TODO: Implement Better Auth integration
        // This is where you would call your Better Auth backend
        // For now, this is a placeholder that you need to connect to your auth system
        
        // Example:
        // const response = await fetch("your-better-auth-endpoint", {
        //     method: "POST",
        //     body: JSON.stringify({ email, password }),
        // });
        
        // Set session cookie or token after successful authentication
        // cookies.set("session", token, { path: "/" });

        return json({ success: true, message: "Signed in successfully" });
    } catch (error) {
        console.error("Sign-in error:", error);
        return json({ message: "Sign in failed" }, { status: 401 });
    }
};
