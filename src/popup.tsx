import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import AITaskFlowApp from './components/AITaskFlow_App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={['/']}>
      <AITaskFlowApp />
    </MemoryRouter>
  </React.StrictMode>
);

