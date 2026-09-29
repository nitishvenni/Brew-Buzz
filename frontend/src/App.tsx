import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { CinematicLandingPage } from './pages/CinematicLandingPage';
import { OutletPerformancePage } from './pages/OutletPerformancePage';
import { OutletDetailPage } from './pages/OutletDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { InventoryDetailPage } from './pages/InventoryDetailPage';
import { WorkforcePage } from './pages/WorkforcePage';
import { WorkforceOutletPage } from './pages/WorkforceOutletPage';
import { WorkforceEmployeePage } from './pages/WorkforceEmployeePage';
import { MarketingPage } from './pages/MarketingPage';


function InitialRedirect() {
  const hasEntered = sessionStorage.getItem('brew_buzz_entered');
  if (!hasEntered) {
    return <Navigate to="/landing" replace />;
  }
  return <Overview />;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitialRedirect />} />
        <Route path="/landing" element={<CinematicLandingPage />} />
        <Route path="/outlet-performance" element={<OutletPerformancePage />} />
        <Route path="/outlet-performance/:outletId" element={<OutletDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/:inventoryItemId" element={<InventoryDetailPage />} />
        <Route path="/workforce" element={<WorkforcePage />} />
        <Route path="/workforce/outlet/:outletId" element={<WorkforceOutletPage />} />
        <Route path="/workforce/employee/:employeeId" element={<WorkforceEmployeePage />} />
        <Route path="/marketing" element={<MarketingPage />} />
        {/* Catch-all: redirect unknown routes to Overview */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
