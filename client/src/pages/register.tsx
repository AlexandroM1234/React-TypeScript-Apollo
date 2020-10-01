import { Formik, Form } from "formik";
import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/core";
import Wrapper from "../components/Wrapper";
import React from "react";
import InputField from "../components/InputField";
import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";
interface registerProps {}

const Register: React.FC<registerProps> = () => {
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data.register.errors) {
            setErrors({});
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Box mt={4}>
              <Button
                type="submit"
                variantColor="teal"
                isLoading={isSubmitting}
              >
                Register
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
