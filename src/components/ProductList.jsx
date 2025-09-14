import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

const pageSize = 10

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [active, setActive] = useState('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [search, brand, active, page])

  async function fetchProducts() {
    setLoading(true)
    let query = supabase.from('Produto').select('*', { count: 'exact' })

    if (search) query = query.ilike('nome_produto', `%${search}%`)
    if (brand) query = query.ilike('marca', `%${brand}%`)
    if (active !== 'all') query = query.eq('ativo', active === 'true')

    query = query.range(page * pageSize, page * pageSize + pageSize - 1)

    const { data, error } = await query
    if (!error) setProducts(data)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Excluir produto?')) return
    await supabase.from('Produto').delete().eq('id_produto', id)
    fetchProducts()
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link to="/novo" className="bg-blue-500 text-white px-4 py-2 rounded">Novo Produto</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar nome"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Marca"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={active}
          onChange={e => setActive(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Foto</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Marca</th>
            <th className="p-2">Preço</th>
            <th className="p-2">Estoque</th>
            <th className="p-2">Ativo</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id_produto} className="border-t">
              <td className="p-2">
                {p.foto1 && <img src={p.foto1} alt={p.nome_produto} className="w-12 h-12 object-cover" />}
              </td>
              <td className="p-2">{p.nome_produto}</td>
              <td className="p-2">{p.marca}</td>
              <td className="p-2">R$ {p.preco_venda_unitario}</td>
              <td className="p-2">{p.quantidade_estoque}</td>
              <td className="p-2">{p.ativo ? 'Sim' : 'Não'}</td>
              <td className="p-2 flex gap-2">
                <Link to={`/editar/${p.id_produto}`} className="text-blue-500">Editar</Link>
                <button onClick={() => handleDelete(p.id_produto)} className="text-red-500">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >Anterior</button>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded"
        >Próxima</button>
      </div>

      {loading && <p className="mt-4">Carregando...</p>}
    </div>
  )
}
