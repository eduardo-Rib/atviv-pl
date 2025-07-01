import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:32831',
});

// export const apiClient = {
//   criarCliente: (data: any) => api.post('/cliente', data),
//   listarClientes: (search?: string) => api.get('/cliente', { params: { search } }),
//   buscarCliente: (id: number) => api.get(`/cliente/${id}`),
//   atualizarCliente: (id: number, data: any) => api.put(`/cliente/${id}`, data),
//   deletarCliente: (id: number) => api.delete(`/cliente/${id}`)
// };

export const apiClient = {
  criarCliente: (data: any) => api.post('/cliente/cadastrar', data),
  listarClientes: (search?: string) => api.get('/cliente/clientes'),
  buscarCliente: (id: number) => api.get(`/cliente/${id}`),
  atualizarCliente: (data: any) => api.put('/cliente/atualizar', data),
  deletarCliente: (id: number) => api.delete('/cliente/excluir', { data: { id } })
};