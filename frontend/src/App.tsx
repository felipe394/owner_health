
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

// Novas importações do Portal de Clientes
import { ClientLogin } from './pages/Client/ClientLogin';
import { ClientProfiles } from './pages/Client/ClientProfiles';
import { ClientLayout } from './components/ClientLayout';
import { ClientDashboard } from './pages/Client/ClientDashboard';
import { ClientProfile } from './pages/Client/ClientProfile';
import { ClientDependents } from './pages/Client/ClientDependents';

// Importações de Recuperação de Senha
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas Gerais */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/client" element={<RegisterClient />} />
        <Route path="/register/company" element={<RegisterCompany />} />

        {/* Rotas do Portal de Clientes (Públicas e Protegidas) */}
        <Route path="/client/login" element={<ClientLogin />} />
        
        <Route path="/client/profiles" element={
          <PrivateRoute redirectTo="/client/login">
            <ClientProfiles />
          </PrivateRoute>
        } />

        <Route path="/client/*" element={
          <PrivateRoute redirectTo="/client/login">
            <ClientLayout>
              <Routes>
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/profile" element={<ClientProfile />} />
                <Route path="/dependents" element={<ClientDependents />} />
                <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
              </Routes>
            </ClientLayout>
          </PrivateRoute>
        } />

        {/* Rotas Protegidas do Portal Administrativo (Geral) */}
        <Route path="/*" element={
          <PrivateRoute redirectTo="/login">
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
