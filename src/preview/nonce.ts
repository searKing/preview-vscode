// Must be imported first: `document.currentScript` is only set while the script runs synchronously.
// The preview's CSP only allows scripts with its nonce, so lazily loaded chunks reuse ours.
declare let __webpack_nonce__: string | undefined;

__webpack_nonce__ = (document.currentScript as HTMLScriptElement | null)?.nonce || undefined;

export { };
