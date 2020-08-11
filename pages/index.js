import Link from "next/link";

export default function Index() {

  return (
    <div>
      <h1 className="text- text-center">welcome to Github-Quest</h1>
      <br></br>
      <div className="d-flex justify-content-around">
        <Link href="/users"><h3 className="text-primary border rounded border-dark p-2"><u>User List</u></h3></Link>
        <Link href="/projects"><h3 className="text-primary border rounded border-dark p-2"><u>Project List</u></h3></Link>
        <Link href="/repositories"><h3 className="text-primary rounded border-dark border p-2"><u>Repository List</u></h3></Link>
      </div>
    </div>)
};
