import { Box, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";

const createPost: React.FC = () => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          console.log(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Box mt={4}>
              <Button
                type="submit"
                variantColor="teal"
                isLoading={isSubmitting}
              >
                Create Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default createPost;
