import React from "react";
import PropTypes from "prop-types";
import * as Sentry from "@sentry/browser";
import "../../node_modules/bootstrap/scss/bootstrap.scss";
import "../../node_modules/react-datepicker/dist/react-datepicker.css";
/**
 *
 * @param {Object} Component // active page
 * @param {Object} pageProps // initial props that were preloaded for your page
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    enabled: true,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}
export default function Index({ Component, pageProps }) {
  return (
    <main className="app-layout">
      <Component {...pageProps} />
    </main>
  );
}

Index.propTypes = {
  Component: PropTypes.func.isRequired,
  pageProps: PropTypes.object.isRequired,
};
