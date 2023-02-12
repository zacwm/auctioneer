import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

import { GeneralProvider } from './contexts/general.context';
import { SocketProvider } from './contexts/socket.context';
import { UserProvider } from './contexts/user.context';

import App from './App';
import './index.css';
import { AdminProvider } from './contexts/admin.context';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <AdminProvider>
      <GeneralProvider>
        <SocketProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </SocketProvider>
      </GeneralProvider>
    </AdminProvider>
  </MantineProvider>
);
