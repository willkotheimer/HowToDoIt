import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { MsalProvider } from '@azure/msal-react';
import { EventType, type AuthenticationResult } from '@azure/msal-browser';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
import './styles/index.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalInstance } from './auth/msalConfig';

const queryClient = new QueryClient();

const FallbackComponent = () => <div>Something went wrong.</div>;

// Registering the callback is allowed before initialize(); it fires later.
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    const payload = event.payload as AuthenticationResult | null;
    const account = payload?.account ?? msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (account) {
      msalInstance.setActiveAccount(account);
    }
  }
});

// All other MSAL calls (getAllAccounts, etc.) must run after initialize().
msalInstance.initialize().then(() => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  ReactDOM.render(
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={FallbackComponent}>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </MsalProvider>,
    document.getElementById('root'),
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
