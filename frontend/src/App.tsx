import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { OutletPerformancePage } from './pages/OutletPerformancePage';
import { OutletDetailPage } from './pages/OutletDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { InventoryDetailPage } from './pages/InventoryDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/outlet-performance" element={<OutletPerformancePage />} />
        <Route path="/outlet-performance/:outletId" element={<OutletDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/:inventoryItemId" element={<InventoryDetailPage />} />
        {/* Catch-all: redirect unknown routes to Overview */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
