import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "../db/index.js";
import { usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, profile.emails[0].value))
        .execute();
      if (user[0]) {
        if (!user[0].googleId) {
          await db
            .update(usersTable)
            .set({ googleId: profile.id })
            .where(eq(usersTable.id, user[0].id))
            .execute();
        }
        return done(null, user[0]);
      } else {
        const newUser = await db
          .insert(usersTable)
          .values({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            age: 25,
          })
          .returning()
          .execute();
        return done(null, newUser[0]);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .execute();
      if (!user[0]) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      if (!user[0].password) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      const match = await bcrypt.compare(password, user[0].password);
      if (!match) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      return done(null, user[0]);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .execute();
  done(null, user[0]);
});
