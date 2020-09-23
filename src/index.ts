import { MikroORM } from "@mikro-orm/core";
import { __prod___ } from "./constatnts";
import { Post } from "./entities/Post";
import mircroconfig from "./mikro-orm.config";
const main = async () => {
  const orm = await MikroORM.init(mircroconfig);
  const post = orm.em.create(Post, { title: "my first post" });

  await orm.em.persistAndFlush(post);
};

main().catch((err) => {
  console.error(err);
});
