import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import AppleStrategy from "passport-apple";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function upsertOAuthUser(provider, providerAccountId, profile) {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName ?? "User";
    let user = null;
    const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true }
    });
    if (account) {
        user = account.user;
    }
    else {
        // Check if user exists with this email
        const existingUser = email ? await prisma.user.findUnique({ where: { email } }) : null;
        if (existingUser) {
            // Link OAuth account to existing user
            user = existingUser;
            await prisma.account.create({
                data: { userId: user.id, provider, providerAccountId, type: "oauth" }
            });
        }
        else {
            // Create new user with OAuth
            user = await prisma.user.create({
                data: {
                    email: email ?? `${provider}:${providerAccountId}@users.local`,
                    name,
                    passwordHash: "oauth",
                    role: "", // Empty role to trigger role selection
                    preferences: {
                        theme: "system",
                        language: "en",
                        notifications: {
                            email: true,
                            push: true,
                            marketing: false,
                        },
                    },
                },
            });
            await prisma.account.create({
                data: { userId: user.id, provider, providerAccountId, type: "oauth" }
            });
        }
    }
    return user;
}
export function setupPassport() {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_BASE_URL ?? "http://localhost:4000"}/auth/google/callback`,
        }, async (_accessToken, _refreshToken, profile, done) => {
            try {
                const user = await upsertOAuthUser("google", profile.id, profile);
                done(null, user);
            }
            catch (e) {
                done(e);
            }
        }));
    }
    if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_BASE_URL ?? "http://localhost:4000"}/auth/facebook/callback`,
            profileFields: ["id", "displayName", "emails"],
        }, async (_accessToken, _refreshToken, profile, done) => {
            try {
                const user = await upsertOAuthUser("facebook", profile.id, profile);
                done(null, user);
            }
            catch (e) {
                done(e);
            }
        }));
    }
    if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
        passport.use(new AppleStrategy({
            clientID: process.env.APPLE_CLIENT_ID,
            teamID: process.env.APPLE_TEAM_ID,
            keyID: process.env.APPLE_KEY_ID,
            privateKey: process.env.APPLE_PRIVATE_KEY.split("\\n").join("\n"),
            callbackURL: `${process.env.BACKEND_BASE_URL ?? "http://localhost:4000"}/auth/apple/callback`,
        }, async (_accessToken, _refreshToken, idToken, _profile, done) => {
            try {
                const sub = idToken?.sub;
                const user = await upsertOAuthUser("apple", sub, { id: sub, displayName: "Apple User" });
                done(null, user);
            }
            catch (e) {
                done(e);
            }
        }));
    }
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            done(null, user);
        }
        catch (e) {
            done(e);
        }
    });
    return passport;
}
