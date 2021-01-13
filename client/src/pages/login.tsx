import { Formik, Form } from "formik";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import React from "react";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { type } from "os";

const Login: React.FC<{}> = () => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          // ERROR HANDLING
          const response = await login(values);
          if (response.data?.login.errors) {
            // if there is an error use toErrorMap to format shape of error to match that from graphql
            setErrors(toErrorMap(response.data.login.errors));
            // if no error and you get the user as a response push to home page
          } else if (response.data?.login.user) {
            // if the query param is there and the user is signed in it will be pushed to the create post page
            if (typeof router.query.next === "string") {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={3}>
              <NextLink href="/ForgotPassword">
                <Link ml="auto">Forgot Password?</Link>
              </NextLink>
            </Flex>
            <Box mt={4}>
              <Button
                type="submit"
                variantColor="teal"
                isLoading={isSubmitting}
              >
                Login
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
