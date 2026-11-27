import type { ReactNode } from 'react'

export default function PageHeading({ title, children }: { title: string; children: ReactNode }) {
  return <div className="page-heading">
    <div><h1>{title}</h1><p>{children}</p></div>
    <div className="mini-database" aria-hidden="true"><i /><i /><i /></div>
  </div>
}
