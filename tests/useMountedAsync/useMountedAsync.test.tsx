import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useMountedAsync } from '../../src/useMountedAsync';

const wait = (waitTime: number) => {
    return new Promise((resolve) => setTimeout(resolve, waitTime));
}

describe('useMountedState', () => {
    const asyncCallback = async function* testCallback(params: {
        firstPromise: Promise<unknown>;
        secondPromise: Promise<unknown>;
        onEnd: () => void;
    }) {
        await params.firstPromise;

        yield;

        await params.secondPromise;

        yield;

        params.onEnd();
    };

    it('should be defined', () => {
        expect(useMountedAsync).toBeDefined();
    });

    it('should run the entire async callback when component is still mounted', async () => {
        const onEndMock = jest.fn();
        const firstPromise = Promise.resolve();

        let captureSecondPromiseResolve: ((value: unknown) => void) | undefined;

        const secondPromise = new Promise((resolve) => {
            captureSecondPromiseResolve = resolve;
        });

        renderHook(
            () => {
                const callback = useMountedAsync(asyncCallback);

                callback({
                    firstPromise,
                    secondPromise,
                    onEnd: onEndMock,
                });
            },
            { initialProps: false }
        );

        captureSecondPromiseResolve?.(undefined);

        await waitFor(() => expect(onEndMock).toHaveBeenCalled(), { timeout: 2000 });
    });

    it('should run the entire async callback even when an unmount happens on the next execution frame', async () => {
            const onEndMock = jest.fn();
        const firstPromise = Promise.resolve();

        let captureSecondPromiseResolve: ((value: unknown) => void) | undefined;

        const secondPromise = new Promise((resolve) => {
            captureSecondPromiseResolve = resolve;
        });

        const hook = renderHook(
            () => {
                const callback = useMountedAsync(asyncCallback);

                callback({
                    firstPromise,
                    secondPromise,
                    onEnd: onEndMock,
                });
            },
            { initialProps: false }
        );

        captureSecondPromiseResolve?.(undefined);

        // Move to the end of the queue
        await wait(0);

        hook.unmount();

        await waitFor(() => expect(onEndMock).toHaveBeenCalled(), { timeout: 2000 });
    });

    it('should abort execution of the async callback when component has been unmounted in the middle of awaiting', async () => {
        const onEndMock = jest.fn();
        const firstPromise = Promise.resolve();

        let captureSecondPromiseResolve: ((value: unknown) => void) | undefined;

        const secondPromise = new Promise((resolve) => {
            captureSecondPromiseResolve = resolve;
        });

        const hook = renderHook(
            () => {
                const callback = useMountedAsync(asyncCallback);

                callback({
                    firstPromise,
                    secondPromise,
                    onEnd: onEndMock,
                });
            },
            { initialProps: false }
        );

        hook.unmount();

        captureSecondPromiseResolve?.(undefined);

        // Move to the end of the queue
        await wait(0);

        expect(onEndMock).not.toHaveBeenCalled();
    });

    it('should abort execution of the async callback when component has been unmounted at the same execution frame as the last promise resolution', async () => {
        const onEndMock = jest.fn();
        const firstPromise = Promise.resolve();

        let captureSecondPromiseResolve: ((value: unknown) => void) | undefined;

        const secondPromise = new Promise((resolve) => {
            captureSecondPromiseResolve = resolve;
        });

        const hook = renderHook(
            () => {
                const callback = useMountedAsync(asyncCallback);

                callback({
                    firstPromise,
                    secondPromise,
                    onEnd: onEndMock,
                });
            },
            { initialProps: false }
        );

        captureSecondPromiseResolve?.(undefined);

        hook.unmount();

        // Move to the end of the queue
        await wait(0);

        expect(onEndMock).not.toHaveBeenCalled();
    });
});
