import type { Instrumentation } from 'next';

type ErrorWithDigest = Error & { digest?: unknown };

/**
 * Keeps production error reports actionable without logging session cookies,
 * request headers, or other user data. The digest shown by error.tsx can be
 * matched directly with the `digest` field in the deployment runtime logs.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const appError = error as ErrorWithDigest;
  const digest = appError && typeof appError.digest !== 'undefined' ? String(appError.digest) : undefined;

  console.error('[server-request-error]', {
    digest,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
