import { redirect } from 'next/navigation'

export default function BlogPostRedirect({ params }: { params: { handle: string } }) {
  redirect(`/blogs/${params.handle}`)
}
