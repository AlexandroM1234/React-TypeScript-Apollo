import { Post } from "src/entities/Post";
import { isAuth } from "src/middleware/isAuth";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  // Query to get posts
  @Query(() => [Post])
  async posts(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    return (
      getConnection()
        .getRepository(Post)
        .createQueryBuilder("p")
        // .where("user.id = :id", { id: 1 })
        .orderBy('"createdAt"', "DESC")
        .take(realLimit)
        .getMany()
    );
  }
  // Query to get 1 post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }
  // Mutation to create a post expects a title
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input")
    input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session!.userId }).save();
  }
  //  Mutation to update a post by id and change the title but if post with a given id is not found returns null
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }
  // Mutation to delete a post by id and returns a boolean if deleted or not
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    await Post.delete(id);

    return true;
  }
}
