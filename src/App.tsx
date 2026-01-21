import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import SkillDetail from './pages/SkillDetail'
import Tags from './pages/Tags'
import Import from './pages/Import'
import AuthorDetail from './pages/AuthorDetail'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <ThemeProvider>
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
              <Route
                path="/skills/:owner/:repo/:name"
                element={<SkillDetail />}
              />
              <Route path="/tags" element={<Tags />} />
              <Route path="/import" element={<Import />} />
              <Route path="/authors/:slug" element={<AuthorDetail />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
