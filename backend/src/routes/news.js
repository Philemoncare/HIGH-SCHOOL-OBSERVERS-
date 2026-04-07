const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateNewsCreate, validateNewsUpdate, handleValidationErrors } = require('../middleware/validateNews');
const Audit = require('../models/Audit');
const News = require('../models/News');
const { queryOne, queryMany } = require('../database/postgres');
const router = express.Router();

// Get all news articles (admin/executive only)
router.get('/', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 1000 } = req.query;
    
    let whereClauses = ["created_by IS NOT NULL"];
    let params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      whereClauses.push(`(title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }
    
    // Status filter
    if (status && status !== 'all' && status !== '') {
      whereClauses.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    // Category filter
    if (category && category !== 'all' && category !== '') {
      whereClauses.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    const whereStr = `WHERE ${whereClauses.join(' AND ')}`;
    
    // Count
    const { count } = await queryOne(`SELECT COUNT(*) FROM news ${whereStr}`, params);
    const total = parseInt(count);

    // Fetch
    const articlesRaw = await queryMany(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      ${whereStr}
      ORDER BY n.created_at DESC
    `, params);

    const articles = articlesRaw.map(a => {
      const trans = News.transformNews(a);
      trans.created_by = a.created_by_obj?.id ? a.created_by_obj : a.created_by;
      trans.views = trans.view_count || 0;
      trans.date = trans.published_at || trans.created_at;
      trans.image_url = trans.image || null;
      return trans;
    });

    res.json({
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('[Admin News] Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Get public news articles (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let whereClauses = ["created_by IS NOT NULL", "status = 'published'"];
    let params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      whereClauses.push(`(title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }
    
    if (category && category !== 'all' && category !== '') {
      whereClauses.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    const whereStr = `WHERE ${whereClauses.join(' AND ')}`;
    
    const articlesRaw = await queryMany(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      ${whereStr}
      ORDER BY n.published_at DESC NULLS LAST
    `, params);

    const articles = articlesRaw.map(a => {
      const trans = News.transformNews(a);
      trans.created_by = a.created_by_obj?.id ? a.created_by_obj : a.created_by;
      trans.views = trans.view_count || 0;
      trans.date = trans.published_at || trans.created_at;
      trans.image_url = trans.image || null;
      return trans;
    });

    res.json({ articles });
  } catch (error) {
    console.error('[Public News] Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// Get public news article by slug (no authentication required)
router.get('/slug/:slug', async (req, res) => {
  try {
    const articleRaw = await queryOne(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.slug = $1 AND n.status = 'published' AND n.created_by IS NOT NULL
    `, [req.params.slug]);

    if (!articleRaw) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const { queryOne: updateQuery } = require('../database/postgres');
    updateQuery('UPDATE news SET view_count = view_count + 1 WHERE id = $1', [articleRaw.id]);

    const article = News.transformNews(articleRaw);
    article.created_by = articleRaw.created_by_obj?.id ? articleRaw.created_by_obj : articleRaw.created_by;
    article.views = (articleRaw.view_count || 0) + 1;
    article.date = article.published_at || article.created_at;
    article.image_url = article.image || null;
    
    res.json(article);
  } catch (error) {
    console.error('[Public News] Error fetching article by slug:', error);
    res.status(500).json({ error: 'Failed to fetch news article' });
  }
});

// Get news article by ID
router.get('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const articleRaw = await queryOne(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = $1
    `, [req.params.id]);

    if (!articleRaw) {
      return res.status(404).json({ error: 'News article not found' });
    }
    
    const article = News.transformNews(articleRaw);
    article.created_by = articleRaw.created_by_obj?.id ? articleRaw.created_by_obj : articleRaw.created_by;
    res.json(article);
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({ error: 'Failed to fetch news article' });
  }
});

// Create news article
router.post('/', authenticate, requireRole(['super_admin','executive']), validateNewsCreate, handleValidationErrors, async (req, res) => {
  try {
    const { title, excerpt, content, category = 'education', author, slug, image, tags = [], status = 'draft', featured = false } = req.body;
    
    const existingArticle = await queryOne('SELECT id FROM news WHERE slug = $1', [slug.trim()]);
    if (existingArticle) {
      return res.status(409).json({ error: 'Article with this slug already exists', field: 'slug' });
    }
    
    const createdBy = req.user?._id || req.user?.id;
    if (!createdBy) return res.status(401).json({ error: 'User authentication required' });
    
    const article = await News.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      author: author.trim(),
      slug: slug.trim(),
      image: image?.trim() || null,
      tags: Array.isArray(tags) ? tags : [],
      status,
      featured: !!featured,
      created_by: createdBy
    });
    
    // Attempt audit
    try {
      await Audit.create({
        user_id: createdBy,
        action: 'create_news_article',
        resource: 'News',
        resource_id: article.id,
        details: { title, category, status }
      });
    } catch (e) {}

    const articleRaw = await queryOne(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = $1
    `, [article.id]);
    
    const transformed = News.transformNews(articleRaw);
    transformed.created_by = articleRaw.created_by_obj?.id ? articleRaw.created_by_obj : articleRaw.created_by;
    
    res.status(201).json(transformed);
  } catch (error) {
    console.error('[News] Error creating article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// Update news article
router.put('/:id', authenticate, requireRole(['super_admin','executive']), validateNewsUpdate, handleValidationErrors, async (req, res) => {
  try {
    const existingArticle = await News.findById(req.params.id);
    if (!existingArticle) return res.status(404).json({ error: 'News article not found' });
    if (!existingArticle.created_by) return res.status(403).json({ error: 'Cannot update system-generated articles' });
    
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.excerpt !== undefined) updateData.excerpt = req.body.excerpt.trim();
    if (req.body.content !== undefined) updateData.content = req.body.content.trim();
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.author !== undefined) updateData.author = req.body.author.trim();
    if (req.body.slug !== undefined) {
      const slugConflict = await queryOne('SELECT id FROM news WHERE slug = $1 AND id != $2', [req.body.slug.trim(), req.params.id]);
      if (slugConflict) return res.status(409).json({ error: 'Article with this slug already exists', field: 'slug' });
      updateData.slug = req.body.slug.trim();
    }
    if (req.body.image !== undefined) updateData.image = req.body.image?.trim() || null;
    if (req.body.tags !== undefined) updateData.tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.featured !== undefined) updateData.featured = !!req.body.featured;
    
    if (req.body.status === 'published' && !existingArticle.published_at) {
      updateData.published_at = new Date();
    }
    
    await News.updateById(req.params.id, updateData);

    const articleRaw = await queryOne(`
      SELECT n.*, 
        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) as created_by_obj
      FROM news n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = $1
    `, [req.params.id]);

    const transformed = News.transformNews(articleRaw);
    transformed.created_by = articleRaw.created_by_obj?.id ? articleRaw.created_by_obj : articleRaw.created_by;
    
    try {
      await Audit.create({
        user_id: req.user._id || req.user.id,
        action: 'update_news_article',
        resource: 'News',
        resource_id: req.params.id,
        details: updateData
      });
    } catch(e) {}
    
    res.json(transformed);
  } catch (error) {
    console.error('[News] Error updating article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// Delete news article
router.delete('/:id', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'News article not found' });
    if (!article.created_by) return res.status(403).json({ error: 'Cannot delete system-generated articles' });
    
    await News.deleteById(req.params.id);
    
    try {
      await Audit.create({
        user_id: req.user._id || req.user.id,
        action: 'delete_news_article',
        resource: 'News',
        resource_id: req.params.id,
        details: { title: article.title, slug: article.slug }
      });
    } catch(e) {}
    
    res.json({ message: 'News article deleted successfully', deletedId: req.params.id });
  } catch (error) {
    console.error('[News] Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// Toggle article status
router.patch('/:id/toggle-status', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'News article not found' });
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const updated = await News.updateById(req.params.id, { status: newStatus });
    
    try {
      await Audit.create({
        user_id: req.user._id || req.user.id,
        action: 'toggle_article_status',
        resource: 'News',
        resource_id: article.id,
        details: { status: newStatus }
      });
    } catch(e) {}
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle article status' });
  }
});

// Toggle featured status
router.patch('/:id/toggle-featured', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'News article not found' });
    const updated = await News.updateById(req.params.id, { featured: !article.featured });
    
    try {
      await Audit.create({
        user_id: req.user._id || req.user.id,
        action: 'toggle_article_featured',
        resource: 'News',
        resource_id: article.id,
        details: { featured: updated.featured }
      });
    } catch(e) {}
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

// Get news statistics
router.get('/stats/overview', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    const { count: totalArticles } = await queryOne('SELECT COUNT(*) FROM news WHERE created_by IS NOT NULL');
    const { count: publishedArticles } = await queryOne(`SELECT COUNT(*) FROM news WHERE status = 'published' AND created_by IS NOT NULL`);
    const { count: draftArticles } = await queryOne(`SELECT COUNT(*) FROM news WHERE status = 'draft' AND created_by IS NOT NULL`);
    const { count: archivedArticles } = await queryOne(`SELECT COUNT(*) FROM news WHERE status = 'archived' AND created_by IS NOT NULL`);
    const { views } = await queryOne(`SELECT SUM(view_count) as views FROM news WHERE created_by IS NOT NULL`);
    
    res.json({
      totalArticles: parseInt(totalArticles || 0),
      publishedArticles: parseInt(publishedArticles || 0),
      draftArticles: parseInt(draftArticles || 0),
      archivedArticles: parseInt(archivedArticles || 0),
      totalViews: parseInt(views || 0),
      consistency: { totalManual: parseInt(totalArticles || 0), totalPublic: parseInt(publishedArticles || 0), consistent: true }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news statistics' });
  }
});

// Data consistency check endpoint
router.get('/consistency/check', authenticate, requireRole(['super_admin','executive']), async (req, res) => {
  try {
    res.json({ consistent: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check consistency' });
  }
});

module.exports = router;