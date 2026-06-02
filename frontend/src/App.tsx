import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { RegisterChoice } from './pages/Register/RegisterChoice';
import { RegisterClient } from './pages/Register/RegisterClient';
import { RegisterCompany } from './pages/Register/RegisterCompany';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ClientList } from './pages/Clients/ClientList';
import { CompanyList } from './pages/Companies/CompanyList';
import { ProfessionalList } from './pages/Professionals/ProfessionalList';
import { HealthPlanList } from './pages/HealthPlans/HealthPlanList';
import { UserList } from './pages/Users/UserList';
import { DependentList } from './pages/Dependents/DependentList';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/client" element={<RegisterClient />} />
        <Route path="/register/company" element={<RegisterCompany />} />

        {/* Rotas Protegidas (Autenticadas) */}
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<ClientList />} />
                <Route path="/companies" element={<CompanyList />} />
                <Route path="/professionals" element={<ProfessionalList />} />
                <Route path="/health-plans" element={<HealthPlanList />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/dependents" element={<DependentList />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
