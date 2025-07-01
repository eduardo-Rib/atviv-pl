import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiUserPlus, FiPhone, FiMapPin, FiSearch } from 'react-icons/fi';
import { apiClient } from '../services/api';
import ClientForm from './ClientForm';

interface TelefoneFromAPI {
  id: number;
  ddd: string;
  numero: string;
}

interface EnderecoFromAPI {
  id: number;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  codigoPostal: string;
  informacoesAdicionais?: string;
}

interface ClienteFromAPI {
  id: number;
  nome: string;
  nomeSocial?: string | null;
  email?: string | null;
  cpf: string;
  endereco?: EnderecoFromAPI | null;
  telefones?: TelefoneFromAPI[];
  createdAt: string;
  updatedAt: string;
}

interface TelefoneForForm {
  id?: number;
  ddd: string;
  numero: string;
}

interface EnderecoForForm {
  id?: number;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  codigoPostal: string;
  informacoesAdicionais?: string;
}

interface ClienteForForm {
  id?: number;
  nome: string;
  nomeSocial?: string;
  email?: string;
  cpf: string;
  endereco?: EnderecoForForm;
  telefones?: TelefoneForForm[];
  createdAt?: string;
  updatedAt?: string;
}

interface ClientListProps {
  clientes: ClienteFromAPI[];
  onRefresh: () => void;
  onSearch: (searchTerm: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clientes, onRefresh, onSearch }) => {
  const [clienteParaEditar, setClienteParaEditar] = useState<ClienteForForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await apiClient.deletarCliente(id);
        onRefresh();
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        alert('Erro ao deletar cliente');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefones = (telefones?: TelefoneFromAPI[]) => {
    if (!telefones || telefones.length === 0) return 'Nenhum telefone cadastrado';
    return telefones.map(tel => `(${tel.ddd}) ${tel.numero.slice(0, tel.numero.length - 4)}-${tel.numero.slice(-4)}`).join(', ');
  };

  const formatEnderecoResumido = (endereco?: EnderecoFromAPI) => {
    if (!endereco) return 'Endereço não cadastrado';
    return `${endereco.cidade}/${endereco.estado}`;
  };

  const convertToFormData = (cliente: ClienteFromAPI): ClienteForForm => ({
    id: cliente.id,
    nome: cliente.nome,
    nomeSocial: cliente.nomeSocial || undefined,
    email: cliente.email || undefined,
    cpf: cliente.cpf,
    endereco: cliente.endereco ? {
      id: cliente.endereco.id,
      estado: cliente.endereco.estado,
      cidade: cliente.endereco.cidade,
      bairro: cliente.endereco.bairro,
      rua: cliente.endereco.rua,
      numero: cliente.endereco.numero,
      codigoPostal: cliente.endereco.codigoPostal,
      informacoesAdicionais: cliente.endereco.informacoesAdicionais || undefined
    } : undefined,
    telefones: cliente.telefones?.map(tel => ({ id: tel.id, ddd: tel.ddd, numero: tel.numero })) || [{ ddd: '', numero: '' }],
    createdAt: cliente.createdAt,
    updatedAt: cliente.updatedAt
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="h-5 w-5 text-blue-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-blue-300 rounded-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setClienteParaEditar({ nome: '', cpf: '', email: '', nomeSocial: '', endereco: { estado: '', cidade: '', bairro: '', rua: '', numero: '', codigoPostal: '', informacoesAdicionais: '' }, telefones: [{ ddd: '', numero: '' }] })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 shadow-md"
        >
          <FiUserPlus className="h-5 w-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {clienteParaEditar && (
        <div className="bg-white rounded-xl shadow-md border border-blue-200">
          <ClientForm
            clienteParaEditar={clienteParaEditar}
            onSuccess={() => { setClienteParaEditar(null); onRefresh(); }}
            onCancel={() => setClienteParaEditar(null)}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden shadow-md border border-blue-200">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700">Clientes Cadastrados</h2>
          <p className="text-sm text-blue-500 mt-1">Total: {clientes.length} clientes</p>
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
              <FiSearch className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-blue-600">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-blue-400">{searchTerm ? 'Tente ajustar sua busca' : 'Cadastre seu primeiro cliente'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase"><div className="flex items-center"><FiPhone className="mr-1" /> Telefones</div></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase"><div className="flex items-center"><FiMapPin className="mr-1" /> Localização</div></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase">Cadastrado em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{cliente.nome}</div>
                      {cliente.nomeSocial && <div className="text-xs text-blue-500 mt-1">Social: {cliente.nomeSocial}</div>}
                      {cliente.email && <div className="text-xs text-blue-500 mt-1">Email: {cliente.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{formatCPF(cliente.cpf)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{formatTelefones(cliente.telefones)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{formatEnderecoResumido(cliente.endereco)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-400">{formatDate(cliente.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setClienteParaEditar(convertToFormData(cliente))}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                          title="Editar"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                          title="Excluir"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;