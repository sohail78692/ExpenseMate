import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function sanitizeImage(img) {
    if (typeof img === "string" && !img.startsWith("data:") && img.length < 1000) {
        return img;
    }
    return null;
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("No user found with the email");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user._id ? user._id.toString() : user.id;
                token.name = user.name;
                token.email = user.email;
                const safeImg = sanitizeImage(user.profileImage || user.image);
                if (safeImg) token.picture = safeImg;
                token.isVerified = user.isVerified || false;
            }
            // Handle session updates dynamically
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.user?.name) token.name = session.user.name;
                if (session.user?.email) token.email = session.user.email;
                if (session.user?.image !== undefined) {
                    const safeImg = sanitizeImage(session.user.image);
                    if (safeImg) token.picture = safeImg;
                }
                if (session.user?.isVerified !== undefined) token.isVerified = session.user.isVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                if (token.name) session.user.name = token.name;
                if (token.email) session.user.email = token.email;
                if (token.picture) session.user.image = token.picture;
                session.user.isVerified = token.isVerified || false;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "gscYMgMImiGIBmJTKU0iew3Kt4TFeMKfleu4fKelvc4",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
