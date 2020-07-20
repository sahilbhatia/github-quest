import Head from 'next/head'

export default function Home() {
  return (
    <div className="container" style={{ height: "100vh" }}>
      <Head>
        <title>github-quest</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body >
        <center >
          <h1 className="title" >
            Github - Quest
        </h1>
        </center>
        <div >
          <h1 className="title" >
            <a href="https://github.com/login/oauth/authorize?client_id=6aa0ca2d884e040075c4">sign in with git hub</a>
          </h1>
        </div>
      </body>
    </div>
  )
}
