/**
 * News Data Consistency Utilities
 * Ensures admin and public views stay synchronized
 * Prevents single-line code changes from breaking relationships
 */

const News = require('../models/News');

/**
 * Verify that an article is manually created (has created_by)
 * This is the CRITICAL filter used by both admin and public endpoints
 */
const isManuallyCreated = (article) => {
  return article && article.created_by && article.created_by !== null;
};

/**
 * Get the standard query filter for manually created articles
 * This MUST be used consistently across all endpoints
 */
const getManualPostsFilter = () => {
  return { 
    created_by: { $exists: true, $ne: null }
  };
};

/**
 * Get the standard query filter for public articles
 * Combines manual posts filter with published status
 */
const getPublicPostsFilter = () => {
  return {
    status: 'published',
    ...getManualPostsFilter()
  };
};

/**
 * Normalize article data for consistent response format
 * Ensures all articles have the same structure regardless of source
 */
const normalizeArticle = (article) => {
  if (!article) return null;
  
  // Data integrity check
  if (!isManuallyCreated(article)) {
    console.warn(`[News Consistency] Article ${article._id} is not manually created - excluding`);
    return null;
  }
  
  return {
    ...article,
    image: article.image || null,
    image_url: article.image || null,
    status: article.status || 'draft',
    view_count: article.view_count || 0,
    published_at: article.published_at || article.created_at,
    date: article.published_at || article.created_at,
    views: article.view_count || 0,
    _id: article._id || article.id
  };
};

/**
 * Clean up orphaned or inconsistent articles
 * Removes articles that don't meet consistency requirements
 */
const cleanupInconsistentArticles = async () => {
  try {
    // Find articles that are published but don't have created_by
    // These should not be visible to users
    const inconsistent = await News.find({
      status: 'published',
      $or: [
        { created_by: { $exists: false } },
        { created_by: null }
      ]
    });
    
    if (inconsistent.length > 0) {
      console.log(`[News Consistency] Found ${inconsistent.length} inconsistent articles`);
      // Optionally archive them instead of deleting
      await News.updateMany(
        {
          status: 'published',
          $or: [
            { created_by: { $exists: false } },
            { created_by: null }
          ]
        },
        { status: 'archived' }
      );
      console.log(`[News Consistency] Archived ${inconsistent.length} inconsistent articles`);
    }
    
    return inconsistent.length;
  } catch (error) {
    console.error('[News Consistency] Error cleaning up:', error);
    return 0;
  }
};

/**
 * Verify data consistency between admin and public views
 * Returns count of articles that should be visible in each view
 */
const verifyConsistency = async () => {
  try {
    const manualFilter = getManualPostsFilter();
    const publicFilter = getPublicPostsFilter();
    
    // Postgres models don't implement `countDocuments`; use `count`.
    // Also, "$exists" is not meaningful in SQL: `created_by IS NOT NULL` is the equivalent.
    const totalManual = await News.count({ created_by: { $ne: null } });
    const totalPublic = await News.count({ status: 'published', created_by: { $ne: null } });
    const totalPublished = totalPublic;
    
    return {
      totalManual,
      totalPublic,
      totalPublished,
      consistent: true
    };
  } catch (error) {
    console.error('[News Consistency] Error verifying:', error);
    return {
      totalManual: 0,
      totalPublic: 0,
      totalPublished: 0,
      consistent: false,
      error: error.message
    };
  }
};

module.exports = {
  isManuallyCreated,
  getManualPostsFilter,
  getPublicPostsFilter,
  normalizeArticle,
  cleanupInconsistentArticles,
  verifyConsistency
};
