import { Post } from "src/entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  // Query to get posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }
  // Query to get 1 post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }
  // Mutation to create a post expects a title
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
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
