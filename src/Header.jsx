function Header({ onGetStarted }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a
          className="site-header__brand"
          href="/"
          aria-label="Income Stack home"
        >
          <span className="site-header__brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span className="site-header__brand-name">
            Income Stack
          </span>
        </a>

        <button
          className="button button--primary site-header__button"
          type="button"
          onClick={onGetStarted}
        >
          Get started
        </button>
      </div>
    </header>
  );
}

export default Header;
