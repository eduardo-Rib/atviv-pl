import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:32831/cliente',
});

export const apiClient = {
  listarClientes: () => api.get('/clientes'),
  buscarCliente: (id: number) => api.get(`/${id}`),
  criarCliente: (data: any) => api.post('/cadastrar', data),
  atualizarCliente: (data: any) => api.put('/atualizar', data),
  deletarCliente: (id: number) => api.delete('/excluir', { data: { id } })
};