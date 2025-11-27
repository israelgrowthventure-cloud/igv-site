import { Page } from '../types';
import { FileText, Trash2, Edit, Eye } from 'lucide-react';

interface PageListProps {
  pages: Page[];
  onSelect: (page: Page) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

export default function PageList({ pages, onSelect, onDelete, onNew }: PageListProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Pages</h1>
            <p className="text-gray-600 mt-1">Manage all your website pages</p>
          </div>
          <button
            onClick={onNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            data-testid="create-new-page"
          >
            + New Page
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-20 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-600 mb-6">Create your first page to get started</p>
            <button
              onClick={onNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create First Page
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{page.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">/{page.slug}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {page.blocks.length} block{page.blocks.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {page.status === 'published' && (
                      <a
                        href={`https://israelgrowthventure.com/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        data-testid="view-page"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </a>
                    )}
                    <button
                      onClick={() => onSelect(page)}
                      className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                      data-testid="edit-page"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => page.id && onDelete(page.id)}
                      className="p-3 bg-red-100 rounded-lg hover:bg-red-200 transition"
                      data-testid="delete-page"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}