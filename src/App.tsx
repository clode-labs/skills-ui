import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SkillDetail from './pages/SkillDetail';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Import from './pages/Import';
import Authors from './pages/Authors';
import AuthorDetail from './pages/AuthorDetail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Home />} />
          <Route path="/skills/:owner/:repo/:name" element={<SkillDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/import" element={<Import />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/:slug" element={<AuthorDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
