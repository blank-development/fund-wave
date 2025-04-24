import { ethers } from "ethers";
import { jwtVerify, SignJWT } from "jose";
import prisma from "./db";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Message template for signature verification
export const SIGN_MESSAGE = "Sign this message to authenticate with Fund Wave";

export async function verifySignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // Ensure the message matches our expected format
    if (message !== SIGN_MESSAGE) {
      return false;
    }

    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Compare the recovered address with the provided wallet address
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function generateToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    throw new Error("Invalid token");
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return Promise.resolve(`${baseUrl}/dashboard`);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const user = await verifyToken(token);
    return {
      user: {
        id: user.userId as string,
        email: user.email as string,
        name: `${user.firstName} ${user.lastName}`,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = await generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    },
    token,
  };
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      walletAddress: "", // Add a default empty wallet address
    },
  });

  const token = await generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    },
    token,
  };
}
