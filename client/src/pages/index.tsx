import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useState } from "react";
import { LikeSection } from "../components/LikeSection";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  if (!fetching && !data) {
    return <div> Query for posts failed</div>;
  }
  return (
    <Layout>
      <Flex textAlign="center">
        <Heading>TwitFaceTagram</Heading>
        <NextLink href="/createPost">
          <Link ml="auto">Create Post</Link>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack>
          {data!.posts.posts.map((p) => (
            <Flex
              key={p.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              flex="1"
              borderRadius="md"
            >
              <LikeSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text>{p.creator.username}</Text>
                <Heading fontSize="md">Likes: {p.points}</Heading>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
