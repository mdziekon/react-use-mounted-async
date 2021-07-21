import { useCallback, useEffect, useRef } from 'react';

/**
 * Wraps any async actions performing callback in an automatic iteration loop,
 * however once the parent component gets unmounted, it automatically breaks the
 * execution on the closest "yield" statement it encounters.
 *
 * It's recommended to use this on any handler callback which performs multiple
 * async operations (eg. form submission with multiple API calls).
 *
 * In the callback's code, there should be a "yield" statement right after every
 * "await" statement:
 * ```
 * const callback = async function* () {
 *     const awaitedValue = await asyncStuff();
 *
 *     yield;
 *
 *     ...rest of the code;
 * }
 * ```
 */
export const useMountedAsync = <Args extends unknown[]>(callback: (...args: Args) => AsyncGenerator) => {
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
        isMountedRef.current = false;
        };
    }, []);

    return useCallback(async (...args: Args) => {
        const generator = callback(...args);

        /**
         * Note: automatic iteration over the generator done on purpose, with
         * iterator's value rejected as unused.
         */
        for await (const _value of generator) {
            if (!isMountedRef.current) {
                return;
            }
        }
    }, [ callback ]);
};
