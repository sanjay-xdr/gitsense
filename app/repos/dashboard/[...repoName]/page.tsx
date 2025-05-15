export default async function Page({
  params,
}: {
  params: Promise<{ repoName: string }>
}) {
  const { repoName } = await params
  console.log(typeof repoName," this is the repoName")
  return <div>My Post: {repoName}</div>
}