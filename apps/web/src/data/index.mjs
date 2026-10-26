import site from './site.json' with { type: 'json' };
import home from './home.json' with { type: 'json' };
import services from './services.json' with { type: 'json' };
import packages from './packages.json' with { type: 'json' };
import categories from './article-categories.json' with { type: 'json' };
import articles from './articles.json' with { type: 'json' };
import portfolios from './portfolios.json' with { type: 'json' };
import gallery from './gallery.json' with { type: 'json' };
import faqs from './faqs.json' with { type: 'json' };

export const contentData = {
  site_settings: site,
  home_content: home,
  services,
  service_packages: packages,
  article_categories: categories,
  articles,
  portfolios,
  gallery,
  faqs,
};
