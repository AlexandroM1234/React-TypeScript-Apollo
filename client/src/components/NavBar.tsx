import { Box, Button, Flex, Link } from "@chakra-ui/core";
import React from "react";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

const NavBar: React.FC = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
  let body = null;
  // data is loading
  if (fetching) {
    body = null;

    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link textDecoration="underline" color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link textDecoration="underline" color=" white" mr={2}>
            Register
          </Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Flex align="center" mr={4}>
          {data.me.username}
        </Flex>
        <Button
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="skyblue" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
