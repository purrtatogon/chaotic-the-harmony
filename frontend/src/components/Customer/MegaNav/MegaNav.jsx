import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { NAV_ITEMS, STORE_DIRECT, STORE_SECTIONS, STORE_TO } from './navConfig';
import styles from '../../../styles/themes/customer.module.css';

// Disclosure-style nav: split link vs chevron, clear labels for AT, Escape moves focus back to the control that opened the panel.

const ChevronDownIcon = ({ open }) => (
  <svg
    aria-hidden="true"
    className={`${styles.navChevron} ${open ? styles.navChevronOpen : ''}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
  </svg>
);

const ChevronRightIcon = ({ active }) => (
  <svg
    aria-hidden="true"
    className={`${styles.navChevronRight} ${active ? styles.navChevronRightActive : ''}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd"
      d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z" />
  </svg>
);

const SearchIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HeartIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const UserIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BagIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const HamburgerIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

const MegaNav = () => {
  const { pathname } = useLocation();
  const navigate      = useNavigate();
  const { itemCount } = useCart();

  const [openMenu,           setOpenMenu]           = useState(null);
  const [activeStoreSection, setActiveStoreSection] = useState(null);
  const [mobileOpen,         setMobileOpen]         = useState(false);
  const [mobileOpenMenu,     setMobileOpenMenu]     = useState(null);
  const [searchOpen,         setSearchOpen]         = useState(false);
  const [searchQuery,        setSearchQuery]        = useState('');

  const wrapperRef       = useRef(null);
  const chevronRefs      = useRef({});
  const storeSectionRefs = useRef({});
  const searchToggleRef  = useRef(null);
  const searchInputRef   = useRef(null);

  useLayoutEffect(() => {
    setOpenMenu(null);
    setActiveStoreSection(null);
    setMobileOpen(false);
    setMobileOpenMenu(null);
    setSearchOpen(false);
    setSearchQuery('');
  }, [pathname]);

  useEffect(() => {
    if (openMenu !== 'store') setActiveStoreSection(null);
  }, [openMenu]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenMenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useLayoutEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const toggleDesktop = useCallback((id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  }, []);

  const toggleMobileMenu = useCallback((id) => {
    setMobileOpenMenu((prev) => (prev === id ? null : id));
  }, []);

  const toggleStoreSection = useCallback((id) => {
    setActiveStoreSection((prev) => (prev === id ? null : id));
  }, []);

  const handleDropdownKeyDown = useCallback((e, id) => {
    if (e.key === 'Escape') {
      setOpenMenu(null);
      chevronRefs.current[id]?.focus();
    }
  }, []);

  const handleSubPanelKeyDown = useCallback((e, sectionId) => {
    if (e.key === 'Escape') {
      setActiveStoreSection(null);
      storeSectionRefs.current[sectionId]?.focus();
    }
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      searchToggleRef.current?.focus();
    }
  }, []);

  const handleLinkClick = useCallback(() => {
    setOpenMenu(null);
    setActiveStoreSection(null);
    setMobileOpen(false);
    setMobileOpenMenu(null);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/?q=${encodeURIComponent(q)}#shop`);
  };

  const renderDropdown = (item) => (
    <ul
      id={`${item.id}-panel`}
      role="list"
      className={styles.navDropdown}
      onKeyDown={(e) => handleDropdownKeyDown(e, item.id)}
    >
      {item.items.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className={styles.navDropdownLink} onClick={handleLinkClick}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const activeSection = STORE_SECTIONS.find((s) => s.id === activeStoreSection);

  const renderStoreFlyout = () => (
    <div
      id="store-panel"
      className={styles.storeMegaPanel}
      onMouseLeave={() => setActiveStoreSection(null)}
      onKeyDown={(e) => handleDropdownKeyDown(e, 'store')}
    >
      <ul role="list" className={styles.storePrimary}>
        {STORE_DIRECT.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={styles.storeDirectLink}
              onMouseEnter={() => setActiveStoreSection(null)}
              onClick={handleLinkClick}
            >
              {link.label}
            </Link>
          </li>
        ))}

        <li className={styles.storeDivider} role="separator" />

        {STORE_SECTIONS.map((section) => {
          const isActive = activeStoreSection === section.id;
          return (
            <li key={section.id}>
              <button
                ref={(el) => { storeSectionRefs.current[section.id] = el; }}
                type="button"
                className={`${styles.storeSectionTrigger} ${isActive ? styles.storeSectionTriggerActive : ''}`}
                aria-expanded={isActive}
                aria-controls={`store-sub-${section.id}`}
                onMouseEnter={() => setActiveStoreSection(section.id)}
                onClick={() => toggleStoreSection(section.id)}
              >
                {section.label}
                <ChevronRightIcon active={isActive} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className={`${styles.storeSubPanel} ${activeSection ? styles.storeSubPanelVisible : ''}`}>
        {STORE_SECTIONS.map((section) => (
          <ul
            key={section.id}
            id={`store-sub-${section.id}`}
            role="list"
            className={styles.storeSubList}
            aria-label={section.label}
            hidden={activeStoreSection !== section.id}
            onKeyDown={(e) => handleSubPanelKeyDown(e, section.id)}
          >
            {section.items.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={styles.navDropdownLink} onClick={handleLinkClick}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );

  const renderSplitItem = (item, isOpen, toggleFn, dropdownEl, mobileSublistId) => (
    <li key={item.id} className={styles.navItem}>
      <Link
        to={item.to}
        className={styles.navLink}
        onClick={handleLinkClick}
      >
        {item.label}
      </Link>

      <button
        ref={(el) => { chevronRefs.current[item.id] = el; }}
        type="button"
        className={`${styles.navChevronButton} ${isOpen ? styles.navChevronButtonActive : ''}`}
        aria-expanded={isOpen}
        aria-controls={`${item.id}-panel`}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label} submenu`}
        onClick={() => toggleFn(item.id)}
      >
        <ChevronDownIcon open={isOpen} />
      </button>

      {isOpen && dropdownEl}

      <ul
        id={mobileSublistId}
        role="list"
        className={`${styles.navMobileSublist} ${
          mobileOpenMenu === item.id ? styles.navMobileSublistOpen : ''
        }`}
        aria-hidden={mobileOpenMenu !== item.id}
      >
        {item.items.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={styles.navMobileLink} onClick={handleLinkClick}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.navMobileSubToggle}
        aria-expanded={mobileOpenMenu === item.id}
        aria-controls={mobileSublistId}
        aria-label={`${mobileOpenMenu === item.id ? 'Collapse' : 'Expand'} ${item.label} submenu`}
        onClick={() => toggleMobileMenu(item.id)}
      >
        <ChevronDownIcon open={mobileOpenMenu === item.id} />
      </button>
    </li>
  );

  return (
    <div ref={wrapperRef} className={styles.navWrapper}>

      <div className={styles.navLogoBar}>
        <Link
          to="/"
          className={styles.navLogoLink}
          onClick={handleLinkClick}
          aria-label="Chaotic the Harmony — home"
        >
          Chaotic the Harmony
        </Link>
      </div>

      <nav aria-label="Main navigation" className={styles.navBar}>
        <div className={styles.navInner}>

          <button
            type="button"
            className={styles.navHamburger}
            aria-expanded={mobileOpen}
            aria-controls="main-nav-panel"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>

          <div
            id="main-nav-panel"
            className={`${styles.navContent} ${mobileOpen ? styles.navContentOpen : ''}`}
          >
            <ul role="list" className={styles.navLinks}>

              <li className={styles.navItem}>
                <Link to="/" className={styles.navLink} onClick={handleLinkClick}>
                  Home
                </Link>
              </li>

              {NAV_ITEMS.filter((item) => item.items).map((item) =>
                renderSplitItem(
                  item,
                  openMenu === item.id,
                  toggleDesktop,
                  renderDropdown(item),
                  `${item.id}-mobile`,
                )
              )}

              <li className={styles.navItem}>
                <Link
                  to={STORE_TO}
                  className={styles.navLink}
                  onClick={handleLinkClick}
                >
                  Store
                </Link>

                <button
                  ref={(el) => { chevronRefs.current['store'] = el; }}
                  type="button"
                  className={`${styles.navChevronButton} ${openMenu === 'store' ? styles.navChevronButtonActive : ''}`}
                  aria-expanded={openMenu === 'store'}
                  aria-controls="store-panel"
                  aria-label={`${openMenu === 'store' ? 'Collapse' : 'Expand'} Store submenu`}
                  onClick={() => toggleDesktop('store')}
                >
                  <ChevronDownIcon open={openMenu === 'store'} />
                </button>

                {openMenu === 'store' && renderStoreFlyout()}

                <ul
                  id="store-mobile"
                  role="list"
                  className={`${styles.navMobileSublist} ${
                    mobileOpenMenu === 'store' ? styles.navMobileSublistOpen : ''
                  }`}
                  aria-hidden={mobileOpenMenu !== 'store'}
                >
                  {[
                    ...STORE_DIRECT,
                    ...STORE_SECTIONS.flatMap((s) => s.items),
                  ].map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className={styles.navMobileLink} onClick={handleLinkClick}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={styles.navMobileSubToggle}
                  aria-expanded={mobileOpenMenu === 'store'}
                  aria-controls="store-mobile"
                  aria-label={`${mobileOpenMenu === 'store' ? 'Collapse' : 'Expand'} Store submenu`}
                  onClick={() => toggleMobileMenu('store')}
                >
                  <ChevronDownIcon open={mobileOpenMenu === 'store'} />
                </button>
              </li>
            </ul>

            <ul role="list" className={styles.navActions}>
              <li>
                <button
                  ref={searchToggleRef}
                  type="button"
                  className={styles.navIconButton}
                  aria-label={searchOpen ? 'Close search' : 'Search products'}
                  aria-expanded={searchOpen}
                  aria-controls="search-form"
                  onClick={() => setSearchOpen((p) => !p)}
                >
                  {searchOpen ? <CloseIcon /> : <SearchIcon />}
                </button>
              </li>
              <li>
                <Link to="/wishlist" className={styles.navIconButton} aria-label="Wishlist" onClick={handleLinkClick}>
                  <HeartIcon />
                </Link>
              </li>
              <li>
                <Link to="/login" className={styles.navLoginButton} aria-label="Login or Sign Up" onClick={handleLinkClick}>
                  <UserIcon />
                  <span className={styles.navLoginLabel}>Login&nbsp;/&nbsp;Sign&nbsp;Up</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className={styles.navIconButton}
                  aria-label={`Cart${itemCount > 0
                    ? `, ${itemCount} item${itemCount === 1 ? '' : 's'}`
                    : ', empty'}`}
                  onClick={handleLinkClick}
                >
                  <BagIcon />
                  {itemCount > 0 && (
                    <span className={styles.navCartBadge} aria-hidden="true">{itemCount}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div id="search-form" className={styles.navSearchRow} onKeyDown={handleSearchKeyDown}>
          <form role="search" className={styles.navSearchForm} onSubmit={handleSearchSubmit}>
            <label htmlFor="site-search" className="srOnly">Search products</label>
            <input
              ref={searchInputRef}
              id="site-search"
              type="search"
              placeholder="Search for music, merch, and more\u2026"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.navSearchInput}
            />
            <button type="submit" className={styles.navSearchSubmit}>Search</button>
          </form>
          <button
            type="button"
            className={styles.navSearchClose}
            aria-label="Close search"
            onClick={() => { setSearchOpen(false); searchToggleRef.current?.focus(); }}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default MegaNav;
