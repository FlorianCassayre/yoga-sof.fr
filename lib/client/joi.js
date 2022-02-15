export const joiValidator = (values, schema) => {
  const { error } = schema.validate(values, { abortEarly: false });
  if(error) {
    return error.details.reduce(
      (errors, error) => ({
        ...errors,
        [error.path]: error.message
      }),
      {}
    );
  } else {
    return {};
  }
};
