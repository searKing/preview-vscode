// Must be imported first: `document.currentScript` is only set while the script runs synchronously.
// The preview's CSP only allows scripts with its nonce, so lazily loaded chunks reuse ours.
declare let __webpack_nonce__: string | undefined;

// eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars -- webpack replaces the assignment, it must stay a plain identifier.
__webpack_nonce__ = (document.currentScript as HTMLScriptElement | null)?.nonce || undefined;

export { };
