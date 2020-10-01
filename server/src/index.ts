import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod___ } from "./constatnts";
import mircroconfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  // initialzied orm with the config file
  const orm = await MikroORM.init(mircroconfig);
  // migrations on auto
  await orm.getMigrator().up();

  const app = express();
  // connects reddis with express session
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  // set up sesstion with express app
  app.use(
    session({
      // session name
      name: "xqc",
      // store with redis
      store: new RedisStore({
        client: redisClient,
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
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
