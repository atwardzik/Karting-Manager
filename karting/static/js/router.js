export function navigate(view, params = {}) {
    const searchParams = new URLSearchParams({
        view,
        ...params,
    });

    globalThis.location.replace(`index?${searchParams.toString()}`);
}
