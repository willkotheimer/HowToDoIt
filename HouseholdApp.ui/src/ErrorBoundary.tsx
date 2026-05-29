import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

interface ErrorBoundaryProps {
  children: ReactNode;
}

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      <h1>Something went wrong.</h1>
      <pre>{error?.message}</pre>
      <button type='button' onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ReactErrorBoundary>
  );
}
