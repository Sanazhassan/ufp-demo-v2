import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  HomePage,
  LinearPage,
  DDLPage,
  DigitalPage,
  FinancePage,
  AuditPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="linear" element={<LinearPage />} />
          <Route path="ddl" element={<DDLPage />} />
          <Route path="digital" element={<DigitalPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
