import { StructuredData } from './StructuredData'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbListProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbListProps) {
  const data = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem' as const,
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <StructuredData data={data} id="breadcrumb-structured-data" />
}
