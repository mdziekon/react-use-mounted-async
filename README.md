# react-use-mounted-async

Reusable hook allowing to run async handlers with automatic cancellation upon component unmount.

Leverages async generators to allow the introduction of "yield" points in your async code, serving as potential cancellation points. During async callback execution, upon parent component getting unmounted, it automatically breaks the execution on the closest "yield" statement.

## Example

```jsx
const handler = async function* (params: unknown) {
    const fooResult = await foo(params);

    yield;

    const barResult = await bar();

    yield;

    /**
     * When unmounted during execution, this should not be reached. This could be
     * eg. a navigation action, which would be unwanted if the user already navigated away.
     */
    finalization();
};

const MyComponent = () => {
    const submitHandler = useMountedAsync(handler);

    return (
        <form onSubmit={submitHandler}>
            <FormContent>
        </form>
    );
};
```
