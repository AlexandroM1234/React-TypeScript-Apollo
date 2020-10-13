import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// Schema for Post
@ObjectType()
@Entity()
export class User extends BaseEntity {
  // Has an id
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  // created at which is made automatically
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
  // updated at which is created automatically
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
  // username which is inputed by the user
  @Field()
  @Column({ unique: true })
  username!: string;
  // Email
  @Field()
  @Column({ unique: true })
  email!: string;

  // password which is inputed by user but cannot be retrieved
  @Column()
  password!: string;
}
