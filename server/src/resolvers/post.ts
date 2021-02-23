import { Likes } from "src/entities/Likes";
import { Post } from "src/entities/Post";
import { isAuth } from "src/middleware/isAuth";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
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
@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: Boolean;
}
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session!;
    const isUpVote = value !== -1;
    const likeValue = isUpVote ? 1 : -1;

    const like = await Likes.findOne({ where: { postId, userId } });
    // user has voted on the post before
    // and their like vote is being changed
    if (like && like.value !== likeValue) {
      // state where usser hasn't liked post before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update likes
          set value = $1
          where "postId" = $2 and "userId" = $3
         `,
          [likeValue, postId, userId]
        );
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2

        `,
          [2 * likeValue, postId]
        );
      });
    } else if (!like) {
      getConnection().transaction(async (tm) => {
        await tm.query(
          `
      insert into likes ("userId", "postId", value)
      values ($1,$2,$3);
        `,
          [userId, postId, likeValue]
        );
        await tm.query(
          `
      update post
      set points = points + $1
      where id = $2
        `,
          [likeValue, postId]
        );
      });
    }

    return true;
  }
  // Query to get posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    // Cursor get the position of the post from the created at and show all the ones after that
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length == realLimitPlusOne,
    };
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
