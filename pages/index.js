import Head from 'next/head';
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <center>
          <h1 className="title">
            <Link href="/repositories"><a>users</a></Link>
            <br></br>
          </h1>
          <h3>
            Welcome to <a href="https://nextjs.org">Next.js!</a>
          </h3>
        </center>
      </main>
    </div>
  )
}
