type Success<T> = { data: T; error: null };
type Failure = { data: null; error: Error };

export async function tryCatch<T>(
  promise: Promise<T>,
): Promise<Success<T> | Failure> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
