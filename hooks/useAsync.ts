import { useCallback, useState } from "react";

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export interface UseAsyncOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const useAsync = <T,>(
    asyncFunction: () => Promise<T>,
    immediate = true
) => {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const response = await asyncFunction();
            setState({ data: response, loading: false, error: null });
            return response;
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            setState({ data: null, loading: false, error: err });
            throw err;
        }
    }, [asyncFunction]);

    const retry = useCallback(() => {
        void execute();
    }, [execute]);

    return { ...state, execute, retry };
};
