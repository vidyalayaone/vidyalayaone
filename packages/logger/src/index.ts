export const logger = (input: unknown): void => {
  if (typeof input === 'object' && input !== null) {
    console.log(JSON.stringify(input, null, 2));
  } else {
    console.log(input);
  }
};
