import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./Components/Layout/Navbar";
import Container from "./Components/Layout/Container";
import Home from "./Components/Pages/Home";
import Footer from "./Components/Layout/Footer";
import Reports from "./Components/Pages/Reports";
import Ranking from "./Components/Pages/Ranking";
import Historico from "./Components/Pages/Historico";
import Login from "./Components/Pages/Login";
import Cadastro from "./Components/Pages/Cadastro";
import { AuthProvider } from "./contexts/AuthProvider";
import UsersProvider from "./contexts/UsersProvider";
import ReportsProvider from "./contexts/ReportsProvider";
import { RankingProvider } from "./contexts/RankingProvider.jsx";
import { HistoricoProvider } from "./contexts/HistoricoProvider.jsx";
import ForumProvider from "./contexts/ForumProvider.jsx";
import ProtectedRoute from "./Config/ProtectedRoute";
import "animate.css";
import AguardeVerificacao from "./Components/Pages/AguardeVerificacao";
import EmailVerificado from "./Components/Pages/EmailVerificado";
import EsqueciSenha from "./Components/Pages/EsqueciSenha";
import RedefinirSenha from "./Components/Pages/RedefinirSenha";
import Sobre from "./Components/Pages/Sobre";
import Comunidade from "./Components/Pages/Comunidade";
import TopicDetail from "./Components/Pages/TopicDetail";
import Atualizacoes from "./Components/Pages/Atualizacoes";

import ParallaxBackground from "./Components/ParallaxBackground";

function AppContent() {
  const location = useLocation();

  // Rotas onde a Navbar não aparece
  const hideNavbarRoutes = [
    "/login",
    "/cadastro",
    "/aguarde-verificacao",
    "/email-verificado",
    "/redefinir-senha",
    "/esqueci-senha",
  ];

  // Check for exact matches or dynamic route patterns
  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    /^\/redefinir-senha\/[^/]+$/.test(location.pathname);

  return (
    <>
      <ParallaxBackground />
      {!shouldHideNavbar && <Navbar />}
      <Container customClass="min_height">
        <Routes>
          <Route
            exact
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ranking"
            element={
              <ProtectedRoute>
                <Ranking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/aguarde-verificacao" element={<AguardeVerificacao />} />
          <Route path="/email-verificado" element={<EmailVerificado />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route
            path="/comunidade"
            element={
              <ProtectedRoute>
                <Comunidade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunidade/topico/:id"
            element={
              <ProtectedRoute>
                <TopicDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atualizacoes"
            element={
              <ProtectedRoute>
                <Atualizacoes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ReportsProvider>
          <ForumProvider>
            <RankingProvider>
              <HistoricoProvider>
                <Router>
                  <AppContent />
                </Router>
              </HistoricoProvider>
            </RankingProvider>
          </ForumProvider>
        </ReportsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
