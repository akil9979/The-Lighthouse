import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import MenuCard from '../components/MenuCard';
import Tooltip from '../components/Tooltip';

const CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner', 'desserts', 'drinks'];
const CATEGORY_ICONS = {
  all: '🍽️', breakfast: '🍳', lunch: '🥗',
  dinner: '🌙', desserts: '🍰', drinks: '🍸'
};

const Menu = () => {
  const { user } = useAuth();
  const { items, loading, error, fetchMenu } = useMenu();

  const [category, setCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.dietaryPreference && user.dietaryPreference !== 'all') {
      setDietFilter(user.dietaryPreference);
    }
  }, [user]);

  useEffect(() => {
    const params = {};
    if (user?.role === 'admin') params.showAll = 'true';
    fetchMenu(params);
  }, [user, fetchMenu]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat  = category === 'all' || item.category === category;
      const matchDiet = dietFilter === 'all'
        || (dietFilter === 'veg' && item.isVeg)
        || (dietFilter === 'non-veg' && !item.isVeg);
      const matchSearch = search === ''
        || item.name.toLowerCase().includes(search.toLowerCase())
        || item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchDiet && matchSearch;
    });
  }, [items, category, dietFilter, search]);

  return (
    <main className="page-enter menu-page">
      <div className="menu-hero">
        <div className="container menu-hero__content">
          <span className="section-label">Our Kitchen</span>
          <h1 className="section-title">The Menu</h1>
          <div className="divider">
            <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
          </div>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Every dish you see here is <strong className="gold">available right now.</strong> No surprises.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="menu-controls">
          <div className="menu-tabs">
            {CATEGORIES.map((cat) => (
              <Tooltip key={cat} content={`Filter by ${cat} category`} position="bottom">
                <button
                  className={`menu-tab ${category === cat ? 'menu-tab--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="menu-filters">
            <div className="diet-toggle">
              <Tooltip content="Show all dishes" position="bottom">
                <button
                  className={`diet-btn ${dietFilter === 'all' ? 'diet-btn--active' : ''}`}
                  onClick={() => setDietFilter('all')}
                >
                  All
                </button>
              </Tooltip>
              <Tooltip content="Filter by vegetarian dishes" position="bottom">
                <button
                  className={`diet-btn ${dietFilter === 'veg' ? 'diet-btn--active' : ''} diet-btn--veg`}
                  onClick={() => setDietFilter('veg')}
                >
                  🟢 Veg
                </button>
              </Tooltip>
              <Tooltip content="Filter by non-vegetarian dishes" position="bottom">
                <button
                  className={`diet-btn ${dietFilter === 'non-veg' ? 'diet-btn--active' : ''} diet-btn--nonveg`}
                  onClick={() => setDietFilter('non-veg')}
                >
                  🔴 Non-Veg
                </button>
              </Tooltip>
            </div>
            <Tooltip content="Search for dishes by name or description" position="bottom">
              <input
                type="text"
                className="form-input"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: '260px' }}
              />
            </Tooltip>
          </div>
        </div>

        {!loading && (
          <p className="menu-count">
            {filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'} found
            {user && user.dietaryPreference !== 'all' && (
              <span className="menu-count__pref"> · Filtered by your profile: <strong className="gold">{user.dietaryPreference}</strong></span>
            )}
          </p>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="menu-error">
            <p>⚠️ {error}</p>
            <Tooltip content="Retry fetching menu data" position="top">
              <button className="btn btn-outline" onClick={() => fetchMenu()}>Retry</button>
            </Tooltip>
          </div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <p>🍽️ No dishes match your filters.</p>
            <Tooltip content="Reset all filters to see full menu" position="top">
              <button className="btn btn-ghost" onClick={() => { setCategory('all'); setDietFilter('all'); setSearch(''); }}>
                Clear filters
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="grid-3" style={{ paddingBottom: 'var(--space-3xl)' }}>
            {filtered.map((item) => <MenuCard key={item._id} item={item} />)}
          </div>
        )}
      </div>

      <style>{`
        .menu-page { padding-top: var(--navbar-h); }
        .menu-hero {
          background: linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg) 100%);
          border-bottom: 1px solid var(--color-border);
          padding: var(--space-3xl) 0 var(--space-2xl);
          text-align: center;
        }
        .menu-controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          padding: var(--space-xl) 0 var(--space-lg);
        }
        .menu-tabs {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-md);
        }
        .menu-tab {
          padding: 0.5rem 1.2rem;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
          border-radius: var(--radius-full);
          transition: all var(--transition);
          border: 1px solid transparent;
        }
        .menu-tab:hover { color: var(--color-text); background: var(--color-surface); }
        .menu-tab--active {
          color: var(--color-primary);
          background: rgba(201,169,98,0.08);
          border-color: var(--color-border-hover);
        }
        .menu-filters { display: flex; align-items: center; gap: var(--space-lg); flex-wrap: wrap; }
        .diet-toggle { display: flex; gap: var(--space-xs); background: var(--color-surface); border-radius: var(--radius-full); padding: 3px; }
        .diet-btn { padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 500; border-radius: var(--radius-full); color: var(--color-text-muted); transition: all var(--transition); }
        .diet-btn--active { background: var(--color-bg-card); color: var(--color-text); }
        .menu-count { font-size: 0.82rem; color: var(--color-text-faint); margin-bottom: var(--space-lg); }
        .menu-error, .menu-empty { text-align: center; padding: var(--space-3xl); color: var(--color-text-muted); display: flex; flex-direction: column; align-items: center; gap: var(--space-lg); }
      `}</style>
    </main>
  );
};

export default Menu;