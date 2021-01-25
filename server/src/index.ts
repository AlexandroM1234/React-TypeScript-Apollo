import "reflect-metadata";
import { COOKIE_NAME, __prod___ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "TwitFaceTagram",
    username: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User],
  });
  await connection.runMigrations();
  // initialzied orm with the config file
  // await Post.delete({});
  const app = express();
  // connects reddis with express session
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  // set up sesstion with express app
  app.use(
    session({
      // session name
      name: COOKIE_NAME,
      // store with redis
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      // cookie options
      cookie: {
        // lasts a day
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod___, // only works in https
      },
      saveUninitialized: false,
      secret: "ahsdfkjlahsakdsjhf",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    // builds apollo schema with resolvers made
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // context with req and res from express and data from orm
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/graphql");
  });
};

main().catch((err) => {
  console.error(err);
});
