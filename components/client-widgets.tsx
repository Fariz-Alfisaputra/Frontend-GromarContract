'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(
  () => import('@/components/chat-widget').then((mod) => mod.ChatWidget),
  { ssr: false }
)

const CartDrawer = dynamic(
  () => import('@/components/shop/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
)

export function ClientWidgets() {
  return (
    <>
      <CartDrawer />
      <ChatWidget />
    </>
  )
}
