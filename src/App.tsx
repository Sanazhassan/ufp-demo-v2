import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  HomePage,
  LinearPage,
  DigitalPage,
  FinancePage,
  AuditPage,
  ConvergedPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="linear" element={<LinearPage />} />
          <Route path="digital" element={<DigitalPage />} />
          <Route path="converged" element={<ConvergedPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
