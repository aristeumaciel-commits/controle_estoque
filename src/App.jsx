import { Routes, Route } from 'react-router-dom'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/novo" element={<ProductForm />} />
      <Route path="/editar/:id" element={<ProductForm />} />
    </Routes>
  )
}
