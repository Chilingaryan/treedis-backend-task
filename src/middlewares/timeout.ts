// Todo: What if timeout gets when uploading?
export const timeout = (ms: number) => () =>
  new Promise((res, rej) => {
    setTimeout(() => {
      rej(new Error("Timeout"));
    }, ms);
  });
