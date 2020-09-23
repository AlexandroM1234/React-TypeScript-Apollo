import { __prod___ } from "./constatnts";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";

export default {
  entities: [Post],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod___,
} as Parameters<typeof MikroORM.init>[0];
