import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import ImageUploader from './ImageUploader'

const initialProduct = {
  nome_produto: '',
  marca: '',
  descricao: '',
  tabela_nutricional: '',
  preco_venda_unitario: '',
  quantidade_estoque: 0,
  estoque_minimo: 0,
  ativo: true,
  foto1: '',
  foto2: '',
  foto3: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(initialProduct)
  const [imageFiles, setImageFiles] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) loadProduct()
  }, [id])

  async function loadProduct() {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setProduct(data)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (
      product.preco_venda_unitario < 0 ||
      product.quantidade_estoque < 0 ||
      product.estoque_minimo < 0
    ) {
      alert('Valores inválidos')
      return
    }
    setLoading(true)
    const updates = { ...product }

    for (const campo of ['foto1', 'foto2', 'foto3']) {
      const file = imageFiles[campo]
      if (file) {
        const ext = file.name.split('.').pop()
        const filePath = `${campo}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('produtos').upload(filePath, file)
        if (!error) {
          const { data } = supabase.storage.from('produtos').getPublicUrl(filePath)
          updates[campo] = data.publicUrl
        }
      }
    }

    if (id) {
      await supabase.from('produtos').update(updates).eq('id', id)
    } else {
      await supabase.from('produtos').insert(updates)
    }

    setLoading(false)
    navigate('/')
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Editar' : 'Novo'} Produto</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="nome_produto"
          value={product.nome_produto}
          onChange={handleChange}
          required
          placeholder="Nome do produto"
          className="border p-2 rounded"
        />
        <input
          name="marca"
          value={product.marca}
          onChange={handleChange}
          placeholder="Marca"
          className="border p-2 rounded"
        />
        <textarea
          name="descricao"
          value={product.descricao}
          onChange={handleChange}
          placeholder="Descrição"
          className="border p-2 rounded"
        />
        <textarea
          name="tabela_nutricional"
          value={product.tabela_nutricional}
          onChange={handleChange}
          placeholder="Tabela nutricional"
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          name="preco_venda_unitario"
          value={product.preco_venda_unitario}
          onChange={handleChange}
          required
          placeholder="Preço de venda"
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          name="quantidade_estoque"
          value={product.quantidade_estoque}
          onChange={handleChange}
          required
          placeholder="Quantidade em estoque"
          className="border p-2 rounded"
        />
        <input
          type="number"
          min="0"
          name="estoque_minimo"
          value={product.estoque_minimo}
          onChange={handleChange}
          required
          placeholder="Estoque mínimo"
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="ativo"
            checked={product.ativo}
            onChange={handleChange}
          />
          Ativo
        </label>

        <ImageUploader
          label="Foto 1"
          url={product.foto1}
          onFileChange={file => setImageFiles(prev => ({ ...prev, foto1: file }))}
        />
        <ImageUploader
          label="Foto 2"
          url={product.foto2}
          onFileChange={file => setImageFiles(prev => ({ ...prev, foto2: file }))}
        />
        <ImageUploader
          label="Foto 3"
          url={product.foto3}
          onFileChange={file => setImageFiles(prev => ({ ...prev, foto3: file }))}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
