import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { NewsForm } from './NewsForm';
import { getAdminNewsById, type NewsItem } from '../../services/newsApi';

export function NewsEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getAdminNewsById(id)
      .then((data) => {
        if (!cancelled) setNews(data);
      })
      .catch((error: any) => {
        toast.error(error?.message || t('news.form.toasts.loadError', 'Failed to load news article'));
        navigate('/news');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate, t]);

  if (loading || !news) {
    return (
      <div className="flex items-center justify-center py-24">
        <p style={{ color: '#666' }}>{t('news.form.loading', 'Loading article...')}</p>
      </div>
    );
  }

  return <NewsForm mode="edit" newsId={id} initialData={news} />;
}
