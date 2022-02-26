export const joiValidator = (values, schema) => {
  const { error: validationError } = schema.validate(values, { abortEarly: false });
  if (validationError) {
    return validationError.details.reduce(
      (errors, error) => ({
        ...errors,
        [error.path]: error.message,
      }),
      {},
    );
  }
  return {};
};
