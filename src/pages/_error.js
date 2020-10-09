import NextErrorComponent from 'next/error';
import * as Sentry from '@sentry/node';

const Error = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err);
  }
  return <NextErrorComponent statusCode={statusCode} />;
};

Error.getInitialProps = async ({ res, err, asPath }) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps({
    res,
    err
  });

  errorInitialProps.hasGetInitialPropsRun = true;

  if (res?.statusCode === 404) {
    return { statusCode: 404 };
  }
  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return errorInitialProps;
  }

  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};
