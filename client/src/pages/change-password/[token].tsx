import { Box, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { Token } from "graphql";
import { NextPage } from "next";
import React from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import login from "../login";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <div>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            // // ERROR HANDLING
            // const response = await login(values);
            // if (response.data?.login.errors) {
            //   // if there is an error use toErrorMap to format shape of error to match that from graphql
            //   setErrors(toErrorMap(response.data.login.errors));
            //   // if no error and you get the user as a response push to home page
            // } else if (response.data?.login.user) {
            //   router.push("/");
            // }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box mt={4}>
                <InputField
                  name="newPassword"
                  placeholder="New Password"
                  label="New Password"
                  type="password"
                />
              </Box>
              <Box mt={4}>
                <Button
                  type="submit"
                  variantColor="teal"
                  isLoading={isSubmitting}
                >
                  Change Password
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </div>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ChangePassword;
