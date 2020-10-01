import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { text } from "express";
import { Field, ObjectType } from "type-graphql";

// Schema for Post
@ObjectType()
@Entity()
export class User {
  // Has an id
  @Field()
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
  // username which is inputed by the user
  @Field()
  @Property({ type: "text", unique: true })
  username!: string;
  // password which is inputed by user but cannot be retrieved
  @Property({ type: text })
  password!: string;
}
