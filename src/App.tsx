import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SkillDetail from './pages/SkillDetail';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Submit from './pages/Submit';
import Import from './pages/Import';
import MySkills from './pages/MySkills';
import SkillEditor from './pages/SkillEditor';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Home />} />
          <Route path="/skills/:owner/:slug" element={<SkillDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/import" element={<Import />} />
          <Route path="/my-skills" element={<MySkills />} />
          <Route path="/my-skills/:owner/:slug/edit" element={<SkillEditor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
