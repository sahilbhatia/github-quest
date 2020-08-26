import React from "react";
import "../../node_modules/bootstrap/scss/bootstrap.scss";
import "../../node_modules/react-datepicker/dist/react-datepicker.css";
/**
 *
 * @param {Object} Component // active page
 * @param {Object} pageProps // initial props that were preloaded for your page
 */
export default function ({ Component, pageProps }) {
  return (
    <main className="app-layout">
      <Component {...pageProps} />
    </main>
  );
};
