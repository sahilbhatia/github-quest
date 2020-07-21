import useSWR from 'swr';
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSWR('/api/getPublicRepos', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return (
      <ul>
        {data.map((user, index) => (
           <li>
           <h3>{user.name}</h3>
         </li>
        ))}
      </ul> 
  )
}
