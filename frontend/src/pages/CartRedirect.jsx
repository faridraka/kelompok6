import { Navigate, useSearchParams } from 'react-router'

// Old /cart links keep working: /cart?coach=1&lane=mid -> /checkout?coach=1&lane=mid
const CartRedirect = () => {
  const [params] = useSearchParams()
  const q = params.toString()
  return <Navigate to={`/checkout${q ? `?${q}` : ''}`} replace />
}

export default CartRedirect
