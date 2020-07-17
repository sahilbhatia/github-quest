import useSWR from 'swr';
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSWR('/api/users', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
    <div>
      <center>
        {data.map((user, index) => (
          <h3 key={index}>
            {user.last_name}
          </h3>
        ))}
      </center>
    </div>
  )
}
