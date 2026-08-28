import { redirect } from 'next/navigation'

export default function BlogPostRedirect({ params }: { params: Promise<{ handle: string }> }) {
  redirect('/blogs')
}
