import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Upload, Trash2, Search, Image, File, MoreVertical, 
  Loader2, CheckCircle, AlertCircle, Grid, List, X, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const MediaLibrary = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listMedia(pagination.page, pagination.limit);
      setMedia(data.media || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error(t('admin.media.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, t]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        errors.push({ name: file.name, error: t('admin.media.invalidType') });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        errors.push({ name: file.name, error: t('admin.media.fileTooLarge') });
        continue;
      }

      try {
        const data = await api.uploadMedia(file);
        uploadedFiles.push(data);
      } catch (error) {
        console.error('Upload error:', error);
        errors.push({ name: file.name, error: t('admin.media.uploadFailed') });
      }
    }

    if (uploadedFiles.length > 0) {
      toast.success(t('admin.media.uploadSuccess', { count: uploadedFiles.length }));
      fetchMedia();
    }

    if (errors.length > 0) {
      errors.forEach(err => {
        toast.error(`${err.name}: ${err.error}`);
      });
    }

    setUploading(false);
    e.target.value = ''; // Reset input
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(t('admin.media.deleteConfirm'))) return;

    setDeleting(filename);
    try {
      await api.deleteMedia(filename);
      toast.success(t('admin.media.deleteSuccess'));
      fetchMedia();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('admin.media.deleteError'));
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('admin.media.copiedToClipboard'));
    }).catch(() => {
      toast.error(t('admin.media.copyFailed'));
    });
  };

  const filteredMedia = media.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.original_name?.toLowerCase().includes(query) ||
      item.filename?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('admin.media.title')} | IGV Admin</title>
      </Helmet>

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.media.title')}</h1>
            <p className="text-gray-600">{t('admin.media.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('admin.media.uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {t('admin.media.upload')}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.media.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredMedia.length > 0 ? (
            t('admin.media.resultsCount', { count: filteredMedia.length, total: pagination.total })
          ) : (
            t('admin.media.noResults')
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Media Grid/List */}
        {!loading && (
          <>
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? t('admin.media.noSearchResults') : t('admin.media.emptyLibrary')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? t('admin.media.tryDifferentSearch') : t('admin.media.uploadFirstImage')}
                </p>
                {!searchQuery && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    <Upload className="w-5 h-5" />
                    {t('admin.media.upload')}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.filename}
                    className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {/* Image Preview */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {item.content_type?.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.original_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <File className="w-12 h-12 text-gray-400" />
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.url);
                        }}
                        className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        title={t('admin.media.copyUrl')}
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.filename);
                        }}
                        className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition"
                        title={t('admin.media.delete')}
                        disabled={deleting === item.filename}
                      >
                        {deleting === item.filename ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* File Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate" title={item.original_name}>
                        {item.original_name || item.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('admin.media.thumbnail')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('admin.media.th.name')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('admin.media.th.size')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('admin.media.th.date')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('admin.media.th.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMedia.map((item) => (
                      <tr key={item.filename} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {item.content_type?.startsWith('image/') ? (
                              <img
                                src={item.url}
                                alt={item.original_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <File className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {item.original_name || item.filename}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {item.filename}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatFileSize(item.size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(item.uploaded_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(item.url)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title={t('admin.media.copyUrl')}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.filename)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title={t('admin.media.delete')}
                              disabled={deleting === item.filename}
                            >
                              {deleting === item.filename ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.previous')}
                </button>
                <span className="px-4 py-2 text-gray-600">
                  {t('admin.media.pageOf', { current: pagination.page, total: pagination.totalPages })}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Media Detail Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedMedia(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {selectedMedia.original_name || selectedMedia.filename}
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {selectedMedia.content_type?.startsWith('image/') ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.original_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('admin.media.th.name')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {selectedMedia.filename}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('admin.media.th.size')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatFileSize(selectedMedia.size)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('admin.media.th.type')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMedia.content_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t('admin.media.th.date')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedMedia.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {t('admin.media.url')}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedMedia.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 break-all"
                      />
                      <button
                        onClick={() => copyToClipboard(selectedMedia.url)}
                        className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    copyToClipboard(selectedMedia.url);
                    setSelectedMedia(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Copy className="w-4 h-4" />
                  {t('admin.media.copyUrl')}
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedMedia.filename);
                    setSelectedMedia(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('admin.media.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MediaLibrary;
