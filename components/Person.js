export default function Person({ person }) {
  return (
    <li>
        <h3>{person.first_name}</h3>
        <h3>{person.last_name}</h3>
    </li>
  )
}
