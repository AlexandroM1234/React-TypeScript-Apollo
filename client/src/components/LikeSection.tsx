import { Flex, IconButton } from "@chakra-ui/core";
import React from "react";
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";
interface LikeSectionProps {
  post: PostSnippetFragment;
}
export const LikeSection: React.FC<LikeSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex
      margin="0% 1%"
      align="center"
      justifyContent="space-evenly"
      direction="column"
    >
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "upvote-loading"}
        aria-label="like post"
        icon="chevron-up"
        size="xs"
        variant="ghost"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        variantColor={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downvote-loading"}
        aria-label="dislike post"
        icon="chevron-down"
        size="xs"
        variant="ghost"
      />
    </Flex>
  );
};
