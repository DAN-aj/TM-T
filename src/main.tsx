/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safeguard window.fetch override issue
(function() {
  try {
    let originalFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return originalFetch;
      },
      set(value) {
        originalFetch = value;
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    // Safe catch
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

