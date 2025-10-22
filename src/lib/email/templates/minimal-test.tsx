import { Html, Body, Text } from '@react-email/components'
import * as React from 'react'

export const MinimalTestEmail = () => {
  return (
    <Html>
      <Body>
        <Text>This is a minimal test email</Text>
        <Text>Mesa T5 - Terraza 1</Text>
      </Body>
    </Html>
  )
}

export default MinimalTestEmail