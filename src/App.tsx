import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import SkillDetail from './pages/SkillDetail';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Import from './pages/Import';
import Authors from './pages/Authors';
import AuthorDetail from './pages/AuthorDetail';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import MySkills from './pages/MySkills';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Main app routes */}
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<Home />} />
            <Route path="/my-skills" element={<MySkills />} />
            <Route path="/skills/:owner/:repo/:name" element={<SkillDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/import" element={<Import />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:slug" element={<AuthorDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
