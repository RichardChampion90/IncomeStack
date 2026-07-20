function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span>Income Stack</span>
        </div>

        <p>
          © {currentYear} Income Stack. Illustrative information, not financial
          advice.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
