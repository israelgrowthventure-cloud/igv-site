import { useState, useEffect } from 'react';
import { Page } from './types';
import { pagesAPI } from './api';
import Auth from './components/Auth';
import PageList from './components/PageList';
import PageEditor from './components/PageEditor';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadPages();
    } else {
      setLoading(false);
    }
  }, []);

  const loadPages = async () => {
    try {
      const response = await pagesAPI.getAll();
      setPages(response.data);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    loadPages();
  };

  const handleNewPage = () => {
    setCurrentPage(null);
    setView('editor');
  };

  const handleSelectPage = (page: Page) => {
    setCurrentPage(page);
    setView('editor');
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await pagesAPI.delete(id);
      loadPages();
    } catch (error) {
      alert('Failed to delete page');
    }
  };

  const handleSavePage = () => {
    setView('list');
    loadPages();
  };

  const handleBack = () => {
    setView('list');
    setCurrentPage(null);
  };

  if (!isAuthenticated) {
    return <Auth onSuccess={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (view === 'editor') {
    return <PageEditor page={currentPage} onBack={handleBack} onSave={handleSavePage} />;
  }

  return (
    <PageList
      pages={pages}
      onSelect={handleSelectPage}
      onDelete={handleDeletePage}
      onNew={handleNewPage}
    />
  );
}

export default App;