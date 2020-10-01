import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// Schema for Post
@ObjectType()
@Entity()
export class Post {
  // Has an id
  @Field(() => Int)
  @PrimaryKey()
  id!: number;
  // created at which is made automatically
  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();
  // updated at which is created automatically
  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();
  // title which is inputed by the user
  @Field()
  @Property({ type: "text" })
  title!: string;
}
