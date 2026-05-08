export function navigate(view, params = {}) {
        globalThis.location.replace(`index?view=${view}`);
}
