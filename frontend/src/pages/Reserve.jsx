import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAvailableSlots, createReservation } from '../api/reservationApi';
import { getTonightMenu } from '../api/menuApi';
import { useAuth } from '../context/AuthContext';
import Tooltip from '../components/Tooltip';

const STEPS = ['Date & Guests', 'Pick a Time', "Tonight's Menu", 'Confirm'];

const Reserve = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [tonightMenu, setTonightMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [specialRequests, setSpecialRequests] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchSlots = async () => {
    if (!date || !guests) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await getAvailableSlots(date, guests);
      setSlots(data.data.slots || []);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 1) {
      setLoadingMenu(true);
      getTonightMenu()
        .then(({ data }) => setTonightMenu(data.data))
        .catch(console.error)
        .finally(() => setLoadingMenu(false));
    }
  }, [step]);

  const handleConfirm = async () => {
    if (!user) { navigate('/auth'); return; }
    setLoading(true);
    setError('');
    // Validate user's email before submitting
    const validateEmail = (email) => {
      if (!email) return false;
      const re = /^\S+@\S+\.\S+$/;
      return re.test(String(email).toLowerCase());
    };

    if (!validateEmail(user.email)) {
      setError('Your account email looks invalid. Please update your email in your profile before confirming.');
      setLoading(false);
      return;
    }
    try {
      await createReservation({ date, time: selectedSlot, guests, specialRequests });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Reservation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="page-enter reserve-page">
        <div className="container reserve-success">
          <div className="success-icon">🎉</div>
          <h1 className="section-title">Reservation Confirmed!</h1>
          <p className="section-subtitle" style={{ margin: '1rem auto' }}>
            Your table is booked for <strong className="gold">{date}</strong> at <strong className="gold">{selectedSlot}</strong> for {guests} guests.
            A confirmation email will be sent shortly.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
            <Tooltip content="Browse our full menu" position="top">
              <Link to="/menu" className="btn btn-outline">Explore the Menu</Link>
            </Tooltip>
            <Tooltip content="Go back to home page" position="top">
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </Tooltip>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-enter reserve-page">
      <div className="container">
        <div className="section-header" style={{ paddingTop: 'var(--space-3xl)' }}>
          <span className="section-label">Smart Reservation</span>
          <h1 className="section-title">Reserve Your Table</h1>
          <div className="divider">
            <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
          </div>
        </div>

        {/* Step indicators with Tooltips */}
        <div className="wizard-steps">
          {STEPS.map((label, i) => (
            <div key={i} className="step-item">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Tooltip content={`Step ${i + 1}: ${label}`} position="bottom">
                  <div className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                </Tooltip>
                <span className={`step-label ${i < step ? 'done' : i === step ? 'active' : ''}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-connector ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="reserve-card glass">
          {/* Step 0: Date & Guests */}
          {step === 0 && (
            <div className="reserve-step">
              <h2 className="reserve-step__title">When are you joining us?</h2>
              <div className="reserve-step__fields">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <Tooltip content="Select your preferred dining date" position="right">
                    <input className="form-input" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
                  </Tooltip>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Guests</label>
                  <Tooltip content="Select the number of guests joining you" position="right">
                    <select className="form-select" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                      {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                    </select>
                  </Tooltip>
                </div>
              </div>
              {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}
              <div className="reserve-step__actions">
                <Tooltip content="Check available time slots for your selected date" position="top">
                  <button className="btn btn-primary" onClick={fetchSlots} disabled={!date || loading}>
                    {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Check Availability →'}
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Step 1: Time Slot */}
          {step === 1 && (
            <div className="reserve-step">
              <h2 className="reserve-step__title">Choose your time slot</h2>
              <p className="reserve-step__subtitle">{date} · {guests} guest{guests > 1 ? 's' : ''}</p>
              <div className="slots-grid">
                {slots.map((slot) => (
                  <Tooltip 
                    key={slot.time} 
                    content={slot.available ? `${slot.tablesAvailable} table${slot.tablesAvailable > 1 ? 's' : ''} available` : 'This slot is fully booked'}
                    position="top"
                  >
                    <button
                      className={`slot-btn ${!slot.available ? 'slot-btn--unavail' : ''} ${selectedSlot === slot.time ? 'slot-btn--selected' : ''}`}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                    >
                      <span className="slot-time">{slot.time}</span>
                      <span className="slot-status">{slot.available ? `${slot.tablesAvailable} table${slot.tablesAvailable > 1 ? 's' : ''} left` : 'Full'}</span>
                    </button>
                  </Tooltip>
                ))}
              </div>
              {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}
              <div className="reserve-step__actions">
                <Tooltip content="Go back to select a different date" position="top">
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                </Tooltip>
                <Tooltip content="View tonight's available dishes before confirming" position="top">
                  <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!selectedSlot}>
                    See Tonight's Menu →
                  </button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Step 2: Tonight's Menu Preview */}
          {step === 2 && (
            <div className="reserve-step">
              <Tooltip content="View tonight's available dishes before confirming your reservation" position="top">
                <h2 className="reserve-step__title">Tonight's Available Menu</h2>
              </Tooltip>
              <div className="tonight-label">
                <span className="avail-dot available" />
                <p className="reserve-step__subtitle">
                  These are the dishes <strong>actually available</strong> for your reservation on {date}.
                  No surprises when you arrive.
                </p>
              </div>
              {loadingMenu ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
              ) : (
                <div className="tonight-grid">
                  {tonightMenu.slice(0, 6).map((item) => (
                    <Tooltip key={item._id} content={`${item.name} - ₹${item.price} · ${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}`} position="top">
                      <div className="tonight-item">
                        <img
                          src={item.image || '/images/dinner.jpg'}
                          alt={item.name}
                          onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
                        />
                        <div className="tonight-item__info">
                          <div className={`tonight-item__dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
                          <div>
                            <p className="tonight-item__name">{item.name}</p>
                            <p className="tonight-item__price">₹{item.price}</p>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}
              <div className="reserve-step__actions">
                <Tooltip content="Go back to select a different time slot" position="top">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                </Tooltip>
                <Tooltip content="Proceed to confirm your reservation" position="top">
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Looks Good! Continue →</button>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="reserve-step">
              <h2 className="reserve-step__title">Confirm Your Reservation</h2>
              {!user && (
                <div className="auth-prompt">
                  <p>Please <Link to="/auth" className="gold">sign in</Link> to complete your reservation.</p>
                </div>
              )}
              <div className="confirm-summary">
                <div className="confirm-row"><span>Date</span><strong>{date}</strong></div>
                <div className="confirm-row"><span>Time</span><strong>{selectedSlot}</strong></div>
                <div className="confirm-row"><span>Guests</span><strong>{guests}</strong></div>
                {user && <div className="confirm-row"><span>Name</span><strong>{user.name}</strong></div>}
              </div>
              <div className="form-group">
                <label className="form-label">Special Requests (optional)</label>
                <Tooltip content="Add dietary requirements, occasion details, or seating preferences" position="right">
                  <textarea className="form-textarea" placeholder="Dietary requirements, occasion, seating preferences..." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} />
                </Tooltip>
              </div>
              {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}
              <div className="reserve-step__actions">
                <Tooltip content="Go back to view tonight's menu" position="top">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                </Tooltip>
                <Tooltip content={user ? "Complete your reservation booking" : "Please sign in first"} position="top">
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirm}
                    disabled={!user || loading}
                    aria-disabled={!user || loading}
                    aria-label="Confirm reservation"
                  >
                    {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Confirm Reservation ✓'}
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reserve-page { padding-top: var(--navbar-h); padding-bottom: var(--space-3xl); }
        .reserve-card { border-radius: var(--radius-xl); padding: var(--space-2xl); max-width: 720px; margin: 0 auto; }
        .reserve-step { display: flex; flex-direction: column; gap: var(--space-lg); }
        .reserve-step__title { font-family: var(--font-serif); font-size: 1.8rem; color: var(--color-text); }
        .reserve-step__subtitle { font-size: 0.88rem; color: var(--color-text-muted); }
        .reserve-step__fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
        .reserve-step__actions { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-lg); border-top: 1px solid var(--color-border); }

        .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--space-sm); max-height: 340px; overflow-y: auto; padding: var(--space-sm) 0; }
        .slot-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0.75rem; border-radius: var(--radius-md); background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted); transition: all var(--transition); }
        .slot-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-text); }
        .slot-btn--selected { border-color: var(--color-primary) !important; background: rgba(201,169,98,0.08) !important; color: var(--color-primary) !important; }
        .slot-btn--unavail { opacity: 0.4; cursor: not-allowed; }
        .slot-time { font-size: 0.95rem; font-weight: 500; }
        .slot-status { font-size: 0.65rem; color: inherit; letter-spacing: 0.04em; }

        .tonight-label { display: flex; align-items: flex-start; gap: 0.5rem; }
        .tonight-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-sm); max-height: 360px; overflow-y: auto; }
        .tonight-item { display: flex; flex-direction: column; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
        .tonight-item img { width: 100%; height: 100px; object-fit: cover; }
        .tonight-item__info { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); }
        .tonight-item__dot { width: 10px; height: 10px; border-radius: 2px; border: 1.5px solid; flex-shrink: 0; }
        .tonight-item__dot.veg { border-color: var(--color-success); background: var(--color-success); }
        .tonight-item__dot.nonveg { border-color: var(--color-error); background: var(--color-error); }
        .tonight-item__name { font-size: 0.82rem; color: var(--color-text); font-weight: 500; }
        .tonight-item__price { font-size: 0.78rem; color: var(--color-primary); }

        .confirm-summary { display: flex; flex-direction: column; gap: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
        .confirm-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
        .confirm-row:last-child { border-bottom: none; }
        .confirm-row span { color: var(--color-text-muted); }
        .confirm-row strong { color: var(--color-text); }
        .auth-prompt { background: rgba(201,169,98,0.08); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg); font-size: 0.88rem; color: var(--color-text-muted); }

        .reserve-success { padding: var(--space-3xl) 0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-md); }
        .success-icon { font-size: 4rem; }

        @media (max-width: 600px) {
          .reserve-step__fields { grid-template-columns: 1fr; }
          .reserve-card { padding: var(--space-lg); }
        }
      `}</style>
    </main>
  );
};

export default Reserve;
