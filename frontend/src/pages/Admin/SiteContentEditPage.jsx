import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeStyles } from '../../utils/themeStyles';
import PageHeader from '../../components/Admin/PageHeader';
import ItemDetailCard from '../../components/Admin/ItemDetailCard';
import ItemDetailField from '../../components/Admin/ItemDetailField';
import Form from '../../components/Global/Form';
import FormRow from '../../components/Global/FormRow';
import FormActions from '../../components/Global/FormActions';
import Input from '../../components/Global/Input';
import Button from '../../components/Global/Button';
import MarkdownFieldEditor from '../../components/Admin/MarkdownFieldEditor/MarkdownFieldEditor.jsx';
import { AdminLoading } from '../../components/Admin/AdminLoggingInAndOutAnimation';
import Error from '../../components/Global/Error';
import { fetchSiteContentById, updateSiteContent } from '../../api/siteContent';
import { canEditSiteContent } from '../../utils/userUtils';
import { getJsonContentValidationError, contentLooksLikeJson } from '../../utils/jsonContent';
import { findGroupBySection } from '../../constants/cmsGroups';

const SiteContentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const styles = getThemeStyles(theme);

  const [block, setBlock] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [contentFormatError, setContentFormatError] = useState(null);

  const allowed = canEditSiteContent();

  const isJsonContent = useMemo(
    () => contentLooksLikeJson(form.content),
    [form.content]
  );

  const backPath = useMemo(() => {
    if (!block) return '/admin/site-content';
    const group = findGroupBySection(block.section);
    return group ? `/admin/site-content/${group.slug}` : '/admin/site-content';
  }, [block]);

  const loadBlock = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      setError('You do not have permission to edit site content.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSiteContentById(id);
      setBlock(data);
      setForm({
        title: data.title ?? '',
        content: data.content ?? '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load block');
    } finally {
      setLoading(false);
    }
  }, [id, allowed]);

  useEffect(() => {
    loadBlock();
  }, [loadBlock]);

  useEffect(() => {
    if (feedback?.type === 'success') {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'content') {
      setContentFormatError(null);
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allowed || !block) return;
    setFeedback(null);
    const jsonErr = getJsonContentValidationError(form.content);
    if (jsonErr) {
      setContentFormatError(jsonErr);
      return;
    }
    setContentFormatError(null);
    try {
      setSubmitting(true);
      await updateSiteContent(block.id, {
        title: form.title,
        content: form.content,
      });
      navigate(backPath);
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AdminLoading styles={styles} message="Loading content block…" />;
  if (error && !block) {
    return (
      <div className={styles.pageContent}>
        <Error message={error} onRetry={loadBlock} />
        <div className={styles.pageActions}>
          <Link className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()} to={backPath}>
            Back to site content
          </Link>
        </div>
      </div>
    );
  }

  if (!block) return null;

  return (
    <div className={styles.pageContent}>
      <PageHeader
        title="Edit site content"
        subtitle={`${block.section} · ${block.key}`}
        actions={
          <Link className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()} to={backPath}>
            ← Back
          </Link>
        }
      />

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.inlineFeedbackSuccess : styles.inlineFeedbackError}
          role="alert"
        >
          <span className={styles.inlineFeedbackIcon} aria-hidden="true">
            {feedback.type === 'success' ? '✓' : '⚠'}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      <ItemDetailCard title="Block details" fullWidth>
        <ItemDetailField label="Section" value={block.section} />
        <ItemDetailField label="Key" value={block.key} />
        <Form onSubmit={handleSubmit}>
          <FormRow>
            <div className={styles.formFullWidthField}>
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={submitting || !allowed}
              />
            </div>
          </FormRow>

          {isJsonContent ? (
            <FormRow>
              <div className={styles.formFullWidthField}>
                <p id="site-content-json-hint" className={styles.formJsonHint}>
                  This value is treated as JSON (starts with <code>{"{"}</code> or <code>[</code>) — it
                  must parse as valid JSON to save.
                </p>
                {contentFormatError && (
                  <div
                    id="site-content-json-error"
                    className={styles.formJsonError}
                    role="alert"
                  >
                    <span className={styles.formJsonErrorIcon} aria-hidden="true">!</span>
                    <span>{contentFormatError}</span>
                  </div>
                )}
                <Input
                  label="Content (JSON)"
                  name="content"
                  type="textarea"
                  value={form.content}
                  onChange={handleChange}
                  disabled={submitting || !allowed}
                  rows={14}
                  aria-invalid={contentFormatError ? 'true' : undefined}
                  aria-describedby={
                    [contentFormatError && 'site-content-json-error', 'site-content-json-hint']
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                />
              </div>
            </FormRow>
          ) : (
            <MarkdownFieldEditor
              label="Content"
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              disabled={submitting || !allowed}
            />
          )}

          {allowed ? (
            <FormActions>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
              <Link
                className={`${styles.actionLink} ${styles.actionLinkSecondary}`.trim()}
                to={backPath}
                aria-disabled={submitting || undefined}
              >
                Cancel
              </Link>
            </FormActions>
          ) : (
            <p className={styles.mutedP} role="alert">
              Only Super Admin and Store Manager can edit site content.
            </p>
          )}
        </Form>
      </ItemDetailCard>
    </div>
  );
};

export default SiteContentEditPage;
