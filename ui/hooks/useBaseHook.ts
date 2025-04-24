import { useState } from "react";

export interface BaseHookState {
  isLoading: boolean;
  error: string | null;
}

export function useBaseHook() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    setError(errorMessage);
    console.error(error);
  };

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    withLoading,
  };
}
