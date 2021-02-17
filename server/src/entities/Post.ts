import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Likes } from "./Likes";
import { User } from "./User";

// Schema for Post
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  // Has an id
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  // title which is inputed by the user
  @Field()
  @Column()
  title!: string;
  // caption field
  @Field()
  @Column()
  text!: string;

  // Likes counter
  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Likes, (likes) => likes.post)
  likes: Likes[];

  // created at which is made automatically
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // updated at which is created automatically
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
