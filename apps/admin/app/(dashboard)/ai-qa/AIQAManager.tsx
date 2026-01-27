'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, CheckCircle, XCircle, Clock, Bot } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';
import Link from 'next/link';

interface AIQuestion {
  id: string;
  question: string;
  answer: string;
  location_scope: 'karasu' | 'kocaali' | 'global';
  page_type: 'pillar' | 'cornerstone' | 'blog' | 'neighborhood' | 'comparison';
  related_entity?: string;
  status: 'draft' | 'approved' | 'published';
  generated_by_ai: boolean;
  reviewed_by?: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export function AIQAManager() {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [pageTypeFilter, setPageTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<AIQuestion | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [locationFilter, pageTypeFilter, statusFilter]);

  async function fetchQuestions() {
    const supabase = createClient();
    if (!supabase) {
      console.error('Supabase client not available');
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      let query = supabase
        .from('ai_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (locationFilter !== 'all') {
        query = query.eq('location_scope', locationFilter);
      }

      if (pageTypeFilter !== 'all') {
        query = query.eq('page_type', pageTypeFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching AI questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: 'draft' | 'approved' | 'published') {
    const supabase = createClient();
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('ai_questions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      fetchQuestions();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Bu soru-cevap çiftini silmek istediğinizden emin misiniz?')) return;

    const supabase = createClient();
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('ai_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  }

  function handleEdit(question: AIQuestion) {
    setEditingQuestion(question);
    setShowEditor(true);
  }

  function handleNew() {
    setEditingQuestion(null);
    setShowEditor(true);
  }

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: questions.length,
    published: questions.filter(q => q.status === 'published').length,
    approved: questions.filter(q => q.status === 'approved').length,
    draft: questions.filter(q => q.status === 'draft').length,
    aiGenerated: questions.filter(q => q.generated_by_ai).length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      published: 'bg-green-100 text-green-700',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getLocationBadge = (location: string) => {
    const styles = {
      karasu: 'bg-red-100 text-red-700',
      kocaali: 'bg-blue-100 text-blue-700',
      global: 'bg-purple-100 text-purple-700',
    };
    return styles[location as keyof typeof styles] || styles.global;
  };

  if (showEditor && editingQuestion !== undefined) {
    return (
      <AIQAEditor
        question={editingQuestion}
        onSave={() => {
          setShowEditor(false);
          setEditingQuestion(null);
          fetchQuestions();
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingQuestion(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Soru veya cevap ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchQuestions} variant="outline">
            Yenile
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Soru-Cevap
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          >
            <option value="all">Tüm Lokasyonlar</option>
            <option value="karasu">Karasu</option>
            <option value="kocaali">Kocaali</option>
            <option value="global">Global</option>
          </select>
        </div>

        <select
          value={pageTypeFilter}
          onChange={(e) => setPageTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        >
          <option value="all">Tüm Sayfa Tipleri</option>
          <option value="pillar">Pillar</option>
          <option value="cornerstone">Cornerstone</option>
          <option value="blog">Blog</option>
          <option value="neighborhood">Mahalle</option>
          <option value="comparison">Karşılaştırma</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="approved">Onaylandı</option>
          <option value="published">Yayında</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Toplam</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-500">Yayında</div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          <div className="text-sm text-gray-500">Onaylandı</div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          <div className="text-sm text-gray-500">Taslak</div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</div>
          <div className="text-sm text-gray-500">AI Üretildi</div>
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="text-center py-12">Yükleniyor...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Soru-cevap bulunamadı
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Soru</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lokasyon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sayfa Tipi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {question.generated_by_ai && (
                        <div className="relative group">
                          <Bot className="h-4 w-4 text-purple-500" />
                          <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            AI Generated
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{question.question}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{question.answer.substring(0, 80)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getLocationBadge(question.location_scope)}`}>
                      {question.location_scope}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {question.page_type}
                    {question.related_entity && (
                      <div className="text-xs text-gray-400">{question.related_entity}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(question.status)}`}>
                      {question.status === 'draft' && 'Taslak'}
                      {question.status === 'approved' && 'Onaylandı'}
                      {question.status === 'published' && 'Yayında'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {question.status === 'draft' && (
                        <button
                          onClick={() => updateStatus(question.id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Onayla"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {question.status === 'approved' && (
                        <button
                          onClick={() => updateStatus(question.id, 'published')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Yayınla"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      
                      {question.status === 'published' && (
                        <button
                          onClick={() => updateStatus(question.id, 'draft')}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Yayından Kaldır"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Editor component (simplified - would need full form)
function AIQAEditor({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: AIQuestion | null; 
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    question: question?.question || '',
    answer: question?.answer || '',
    location_scope: question?.location_scope || 'karasu',
    page_type: question?.page_type || 'pillar',
    related_entity: question?.related_entity || '',
    priority: question?.priority || 'medium',
    category: question?.category || '',
  });

  async function handleSave() {
    const supabase = createClient();
    if (!supabase) {
      console.error('Supabase client not available');
      alert('Supabase bağlantısı kurulamadı');
      return;
    }
    
    try {
      if (question) {
        // Update
        const { error } = await supabase
          .from('ai_questions')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', question.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('ai_questions')
          .insert({
            ...formData,
            status: 'draft',
            generated_by_ai: false,
          });

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Kaydetme hatası');
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {question ? 'Soru-Cevap Düzenle' : 'Yeni Soru-Cevap'}
        </h2>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline">İptal</Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soru</label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cevap</label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasyon</label>
            <select
              value={formData.location_scope}
              onChange={(e) => setFormData({ ...formData, location_scope: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="karasu">Karasu</option>
              <option value="kocaali">Kocaali</option>
              <option value="global">Global</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Tipi</label>
            <select
              value={formData.page_type}
              onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="pillar">Pillar</option>
              <option value="cornerstone">Cornerstone</option>
              <option value="blog">Blog</option>
              <option value="neighborhood">Mahalle</option>
              <option value="comparison">Karşılaştırma</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İlgili Entity (Slug)</label>
          <input
            type="text"
            value={formData.related_entity}
            onChange={(e) => setFormData({ ...formData, related_entity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            placeholder="karasu-satilik-ev"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori (Opsiyonel)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              placeholder="bilgi, yatirim, karsilastirma"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
