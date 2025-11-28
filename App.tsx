import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Detail from './pages/Detail';
import Simulation from './pages/Simulation';
import { COMPONENTS } from './constants';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (page !== 'library') {
      setSelectedComponentId(null);
    }
  };

  const handleSelectComponent = (id: string) => {
    setSelectedComponentId(id);
    setActivePage('detail');
  };

  const renderContent = () => {
    if (activePage === 'detail' && selectedComponentId) {
      const component = COMPONENTS.find(c => c.id === selectedComponentId);
      if (component) {
        return <Detail component={component} onBack={() => handleNavigate('library')} />;
      }
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'library':
        return <Library onSelectComponent={handleSelectComponent} />;
      case 'simulation':
        return <Simulation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default App;
