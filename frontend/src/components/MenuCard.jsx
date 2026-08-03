import { toggleAvailability } from '../api/menuApi';
import { getMenuItems } from '../api/menuApi';
import { getReviews } from '../api/reviewApi';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

const TAG_LABELS = {
  'seasonal':     { label: 'Seasonal', icon: '🍃' },
  'chef-special': { label: "Chef's Special", icon: '👨‍🍳' },
  'popular':      { label: 'Popular', icon: '⭐' },
  'new':          { label: 'New', icon: '✨' },
  'spicy':        { label: 'Spicy', icon: '🌶️' }
};

const MenuCard = ({ item }) => {
  const { updateItem } = useMenu();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [toggling, setToggling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dishReviews, setDishReviews] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isAdmin = user?.role === 'admin';

  const hasCustomizations =
    (item.customizations?.toppings?.length > 0) || (item.customizations?.variants?.length > 0);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Reset customization state fresh every time the modal opens for this item
  useEffect(() => {
    if (!isOpen) return;
    setSelectedToppings([]);
    setSelectedVariant(item.customizations?.variants?.[0] || null);
    setQuantity(1);
    setJustAdded(false);
  }, [isOpen, item._id]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const [{ data: reviewData }, { data: menuData }] = await Promise.all([
          getReviews(),
          getMenuItems({ category: item.category })
        ]);

        if (!isMounted) return;

        const related = (menuData.data || [])
          .filter((menuItem) => menuItem._id !== item._id && menuItem.category === item.category)
          .slice(0, 3);

        const filteredReviews = (reviewData.data || []).filter((review) => {
          const reviewMenuId = review.menuItem?._id || review.menuItem;
          return reviewMenuId === item._id || reviewMenuId === item.id;
        });

        setDishReviews(filteredReviews);
        setRelatedItems(related);
      } catch (error) {
        console.error('Failed to load dish details', error);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => { isMounted = false; };
  }, [isOpen, item._id, item.category, item.id]);

  const handleToggle = async (event) => {
    event.stopPropagation();
    setToggling(true);
    try {
      const { data } = await toggleAvailability(item._id);
      updateItem(data.data);
    } catch (err) {
      console.error('Toggle failed', err);
    } finally {
      setToggling(false);
    }
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // ---- Customization logic ----
  const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const variantModifier = selectedVariant?.priceModifier || 0;
  const unitPrice = item.price + toppingsTotal + variantModifier;
  const finalPrice = unitPrice * quantity;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.name === topping.name);
      if (exists) return prev.filter((t) => t.name !== topping.name);
      if (item.customizations?.allowMultipleToppings === false) return [topping];
      return [...prev, topping];
    });
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addToCart({
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      selectedToppings,
      selectedVariant,
      quantity,
      unitPrice
    });
    setJustAdded(true);
    setTimeout(() => setIsOpen(false), 700);
  };

  return (
    <>
      <article
        className={`menu-card card ${!item.isAvailable ? 'menu-card--unavailable' : ''}`}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpen();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="menu-card__image-wrap">
          <img
            src={item.image || '/images/dinner.jpg'}
            alt={item.name}
            className="menu-card__image"
            onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
          />

          <Tooltip content={item.isAvailable ? "Available today" : "Sold out today"} position="top">
            <div className={`menu-card__avail-badge ${item.isAvailable ? 'available' : 'sold-out'}`}>
              <span className={`avail-dot ${item.isAvailable ? 'available' : 'unavailable'}`} />
              {item.isAvailable ? 'Available' : 'Sold Out'}
            </div>
          </Tooltip>

          <Tooltip content={item.isVeg ? 'Vegetarian dish' : 'Non-Vegetarian dish'} position="bottom">
            <div className={`menu-card__diet-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
          </Tooltip>
        </div>

        <div className="menu-card__body">
          <div className="menu-card__tags">
            {(item.tags || []).map((tag) => (
              <Tooltip key={tag} content={`${TAG_LABELS[tag]?.label || tag} dish`} position="top">
                <span className="badge badge-gold">
                  {TAG_LABELS[tag]?.icon} {TAG_LABELS[tag]?.label || tag}
                </span>
              </Tooltip>
            ))}
          </div>

          <h3 className="menu-card__name">{item.name}</h3>
          <p className="menu-card__desc">{item.description}</p>

          <div className="menu-card__footer">
            <span className="menu-card__price">₹{item.price}</span>
            <Tooltip content={`Preparation time: ${item.preparationTime} minutes`} position="top">
              <span className="menu-card__time">⏱ {item.preparationTime} min</span>
            </Tooltip>
          </div>

          {isAdmin && (
            <div className="menu-card__admin" onClick={(event) => event.stopPropagation()}>
              <Tooltip content={item.isAvailable ? "Mark as sold out" : "Mark as available"} position="top">
                <span className="menu-card__admin-label">
                  {item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                </span>
              </Tooltip>
              <Tooltip content="Toggle dish availability" position="top">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={item.isAvailable}
                    onChange={handleToggle}
                    disabled={toggling}
                  />
                  <span className="toggle-slider" />
                </label>
              </Tooltip>
            </div>
          )}
        </div>

        <style>{`
          .menu-card { position: relative; display: flex; flex-direction: column; cursor: pointer; transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition); }
          .menu-card:hover { transform: translateY(-4px); border-color: var(--color-border-hover); box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
          .menu-card--unavailable { opacity: 0.6; }
          .menu-card--unavailable .menu-card__image { filter: grayscale(60%); }
          .menu-card__image-wrap { position: relative; overflow: hidden; height: 200px; }
          .menu-card__image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
          .menu-card:hover .menu-card__image { transform: scale(1.05); }

          .menu-card__avail-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: var(--radius-full);
            font-size: 0.65rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            backdrop-filter: blur(8px);
          }
          .menu-card__avail-badge.available { background: rgba(76,175,125,0.2); color: var(--color-success); border: 1px solid rgba(76,175,125,0.3); }
          .menu-card__avail-badge.sold-out  { background: rgba(120,120,120,0.25); color: var(--color-text-muted); border: 1px solid rgba(120,120,120,0.3); }

          .menu-card__diet-dot {
            position: absolute;
            bottom: 10px;
            left: 10px;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            border: 2px solid;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .menu-card__diet-dot::after {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          .menu-card__diet-dot.veg    { border-color: var(--color-success); }
          .menu-card__diet-dot.veg::after { background: var(--color-success); }
          .menu-card__diet-dot.nonveg { border-color: var(--color-error); }
          .menu-card__diet-dot.nonveg::after { background: var(--color-error); }

          .menu-card__body { padding: var(--space-lg); flex: 1; display: flex; flex-direction: column; gap: var(--space-sm); }
          .menu-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
          .menu-card__name { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text); }
          .menu-card__desc { font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.5; flex: 1; }
          .menu-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
          .menu-card__price { font-family: var(--font-serif); font-size: 1.4rem; color: var(--color-primary); }
          .menu-card__time  { font-size: 0.75rem; color: var(--color-text-faint); }

          .menu-card__admin {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: var(--space-md);
            border-top: 1px dashed var(--color-border);
          }
          .menu-card__admin-label { font-size: 0.75rem; color: var(--color-text-faint); }

          .menu-card-detail__backdrop {
            position: fixed;
            inset: 0;
            background: rgba(6, 6, 6, 0.78);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-xl);
            z-index: 2000;
          }
          .menu-card-detail {
            width: min(900px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            box-shadow: 0 18px 60px rgba(0,0,0,0.4);
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
          }
          .menu-card-detail__media { position: relative; min-height: 320px; }
          .menu-card-detail__image { width: 100%; height: 100%; object-fit: cover; }
          .menu-card-detail__content { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-lg); }
          .menu-card-detail__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); }
          .menu-card-detail__title { font-family: var(--font-serif); font-size: 1.8rem; color: var(--color-text); margin: 0.3rem 0 0.2rem; }
          .menu-card-detail__subtitle { font-size: 0.82rem; color: var(--color-text-faint); text-transform: capitalize; }
          .menu-card-detail__price-pill { background: rgba(201,169,98,0.14); border: 1px solid rgba(201,169,98,0.28); color: var(--color-primary); padding: 0.6rem 0.95rem; border-radius: var(--radius-full); font-weight: 600; white-space: nowrap; }
          .menu-card-detail__desc { color: var(--color-text-muted); line-height: 1.8; font-size: 0.96rem; }
          .menu-card-detail__meta { display: flex; flex-wrap: wrap; gap: 0.6rem; }
          .menu-card-detail__tag { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.8rem; border-radius: var(--radius-full); background: rgba(255,255,255,0.05); border: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 0.8rem; }
          .menu-card-detail__tag.veg { color: var(--color-success); border-color: rgba(76,175,125,0.25); }
          .menu-card-detail__tag.nonveg { color: var(--color-error); border-color: rgba(224,92,92,0.2); }
          .menu-card-detail__reviews { display: flex; flex-direction: column; gap: 0.8rem; }
          .menu-card-detail__reviews h4 { font-family: var(--font-serif); font-size: 1.1rem; color: var(--color-text); margin: 0; }
          .menu-card-detail__review { padding: 0.9rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
          .menu-card-detail__review strong { color: var(--color-text); }
          .menu-card-detail__review p { margin-top: 0.35rem; color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.6; }
          .menu-card-detail__related { display: flex; flex-wrap: wrap; gap: 0.75rem; }
          .menu-card-detail__related-item { padding: 0.7rem 0.85rem; border-radius: var(--radius-md); background: rgba(201,169,98,0.08); color: var(--color-primary); font-size: 0.88rem; border: 1px solid rgba(201,169,98,0.16); }
          .menu-card-detail__close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0,0,0,0.4);
            color: var(--color-text);
            font-size: 1.25rem;
            cursor: pointer;
          }

          .menu-card-detail__customize { display: flex; flex-direction: column; gap: 0.9rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
          .menu-card-detail__customize h4 { font-family: var(--font-serif); font-size: 1.05rem; color: var(--color-text); margin: 0; }
          .customize__group { display: flex; flex-direction: column; gap: 0.5rem; }
          .customize__label { font-size: 0.75rem; color: var(--color-text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
          .customize__options { display: flex; flex-wrap: wrap; gap: 0.7rem 1.1rem; }
          .customize__option { display: flex; align-items: center; gap: 0.45rem; font-size: 0.9rem; color: var(--color-text-muted); cursor: pointer; }
          .customize__option input { accent-color: var(--color-primary); cursor: pointer; }
          .customize__quantity { display: flex; align-items: center; gap: 0.9rem; }
          .customize__quantity button {
            width: 30px; height: 30px; border-radius: 50%;
            border: 1px solid var(--color-border); background: transparent;
            color: var(--color-text); font-size: 1rem; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: border-color var(--transition), background var(--transition);
          }
          .customize__quantity button:hover { border-color: var(--color-primary); background: rgba(201,169,98,0.08); }
          .customize__quantity span { min-width: 20px; text-align: center; font-weight: 600; color: var(--color-text); }
          .customize__total {
            display: flex; justify-content: space-between; align-items: center;
            padding-top: 0.75rem; border-top: 1px dashed var(--color-border);
          }
          .customize__total span { font-size: 0.85rem; color: var(--color-text-faint); text-transform: uppercase; letter-spacing: 0.05em; }
          .customize__total strong { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-primary); }
          .customize__add-btn { width: 100%; transition: background var(--transition), transform var(--transition); }
          .customize__add-btn:disabled { opacity: 0.75; cursor: default; }

          @media (max-width: 768px) {
            .menu-card-detail { grid-template-columns: 1fr; }
            .menu-card-detail__media { min-height: 240px; }
            .menu-card-detail__content { padding: var(--space-lg); }
          }
        `}</style>
      </article>

      {isOpen && (
        <div className="menu-card-detail__backdrop" onClick={handleClose}>
          <div className="menu-card-detail" onClick={(event) => event.stopPropagation()}>
            <div className="menu-card-detail__media">
              <img
                src={item.image || '/images/dinner.jpg'}
                alt={item.name}
                className="menu-card-detail__image"
                onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
              />
              <button type="button" className="menu-card-detail__close" onClick={handleClose} aria-label="Close dish details">×</button>
            </div>
            <div className="menu-card-detail__content">
              <div className="menu-card-detail__header">
                <div>
                  <span className="section-label">Dish Details</span>
                  <h3 className="menu-card-detail__title">{item.name}</h3>
                  <p className="menu-card-detail__subtitle">{item.category} • {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                </div>
                <div className="menu-card-detail__price-pill">₹{item.price}</div>
              </div>

              <p className="menu-card-detail__desc">{item.description}</p>

              <div className="menu-card-detail__meta">
                <span className={`menu-card-detail__tag ${item.isVeg ? 'veg' : 'nonveg'}`}>
                  {item.isVeg ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
                </span>
                <span className="menu-card-detail__tag">⏱ {item.preparationTime} min</span>
                <span className="menu-card-detail__tag">{item.category}</span>
              </div>

              <div className="menu-card-detail__customize" onClick={(event) => event.stopPropagation()}>
                {hasCustomizations && <h4>Customize your dish</h4>}

                {item.customizations?.variants?.length > 0 && (
                  <div className="customize__group">
                    <span className="customize__label">Choose size / variant</span>
                    <div className="customize__options">
                      {item.customizations.variants.map((variant) => (
                        <label key={variant.name} className="customize__option">
                          <input
                            type="radio"
                            name={`variant-${item._id}`}
                            checked={selectedVariant?.name === variant.name}
                            onChange={() => setSelectedVariant(variant)}
                          />
                          {variant.name}
                          {variant.priceModifier > 0 && <span>&nbsp;(+₹{variant.priceModifier})</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {item.customizations?.toppings?.length > 0 && (
                  <div className="customize__group">
                    <span className="customize__label">Add-ons / toppings</span>
                    <div className="customize__options">
                      {item.customizations.toppings.map((topping) => (
                        <label key={topping.name} className="customize__option">
                          <input
                            type={item.customizations?.allowMultipleToppings === false ? 'radio' : 'checkbox'}
                            name={item.customizations?.allowMultipleToppings === false ? `topping-${item._id}` : undefined}
                            checked={selectedToppings.some((t) => t.name === topping.name)}
                            onChange={() => toggleTopping(topping)}
                          />
                          {topping.name}&nbsp;(+₹{topping.price})
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="customize__quantity">
                  <span className="customize__label">Quantity</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
                </div>

                <div className="customize__total">
                  <span>Total</span>
                  <strong>₹{finalPrice}</strong>
                </div>

                <button
                  type="button"
                  className="btn btn-primary customize__add-btn"
                  onClick={handleAddToCart}
                  disabled={justAdded || !item.isAvailable}
                >
                  {justAdded ? 'Added ✓' : !item.isAvailable ? 'Currently Sold Out' : `Add to Cart — ₹${finalPrice}`}
                </button>
              </div>

              <div className="menu-card-detail__reviews">
                <h4>Guest reviews</h4>
                {loadingDetails ? (
                  <p className="menu-card-detail__desc">Loading reviews...</p>
                ) : dishReviews.length > 0 ? (
                  dishReviews.slice(0, 3).map((review, index) => (
                    <div
                      key={review._id || `${review.user?.name || 'guest'}-${index}`}
                      className="menu-card-detail__review"
                    >
                      <strong>{review.user?.name || 'Guest'}</strong>
                      <p>“{review.comment}”</p>
                    </div>
                  ))
                ) : (
                  <p className="menu-card-detail__desc">No reviews yet for this dish.</p>
                )}
              </div>

              {relatedItems.length > 0 && (
                <div className="menu-card-detail__reviews">
                  <h4>Related dishes</h4>
                  <div className="menu-card-detail__related">
                    {relatedItems.map((relatedItem, index) => (
                      <span
                        key={relatedItem._id || `${relatedItem.name || 'related'}-${index}`}
                        className="menu-card-detail__related-item"
                      >
                        {relatedItem.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCard;