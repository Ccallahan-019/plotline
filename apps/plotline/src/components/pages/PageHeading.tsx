import { PropsWithChildren } from 'react'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '../ui/item'
import { ShowIf } from '../utils/ShowIf'

type PageHeadingProps = PropsWithChildren<{
  description: string
  title: string
}>

export function PageHeading({ children, description, title }: PageHeadingProps) {
  return (
    <Item className="p-0">
      <ItemContent>
        <ItemTitle className="font-heading text-xl font-semibold">{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ShowIf condition={children != null}>
        <ItemActions>{children}</ItemActions>
      </ShowIf>
    </Item>
  )
}
