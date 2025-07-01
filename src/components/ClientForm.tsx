import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiUser, FiMail, FiCreditCard, FiPlus, FiMinus } from 'react-icons/fi';
import { apiClient } from '../services/api';

interface Telefone {
  id?: number;
  ddd: string;
  numero: string;
}

interface Endereco {
  id?: number;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  codigoPostal: string;
  informacoesAdicionais?: string;
}

interface Cliente {
  id?: number;
  nome: string;
  nomeSocial?: string;
  email?: string;
  cpf: string;
  endereco: Endereco;
  telefones: Telefone[];
  createdAt?: string;
  updatedAt?: string;
}

interface ClientFormProps {
  clienteParaEditar?: Cliente | null;
  onSuccess: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

interface FormErrors {
  nome?: string;
  email?: string;
  cpf?: string;
  endereco?: {
    estado?: string;
    cidade?: string;
    bairro?: string;
    rua?: string;
    numero?: string;
    codigoPostal?: string;
  };
  telefones?: (string | undefined)[];
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  clienteParaEditar, 
  onSuccess, 
  onCancel,
  isSubmitting,
  setIsSubmitting
}) => {
  const initialEndereco: Endereco = {
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    numero: '',
    codigoPostal: '',
    informacoesAdicionais: ''
  };

  const initialTelefone: Telefone = {
    ddd: '',
    numero: ''
  };

  const [formData, setFormData] = useState<Cliente>({
    nome: '',
    cpf: '',
    email: '',
    nomeSocial: '',
    endereco: initialEndereco,
    telefones: [initialTelefone]
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (clienteParaEditar) {
      setFormData({
        nome: clienteParaEditar.nome,
        cpf: clienteParaEditar.cpf,
        email: clienteParaEditar.email || '',
        nomeSocial: clienteParaEditar.nomeSocial || '',
        endereco: clienteParaEditar.endereco,
        telefones: clienteParaEditar.telefones.length > 0 
          ? clienteParaEditar.telefones 
          : [initialTelefone],
        id: clienteParaEditar.id
      });
    } else {
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        nomeSocial: '',
        endereco: initialEndereco,
        telefones: [initialTelefone]
      });
    }
    setErrors({});
  }, [clienteParaEditar]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    }

    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (!cpfDigits) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else if (cpfDigits.length !== 11) {
      newErrors.cpf = 'CPF deve conter 11 dígitos';
      isValid = false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    const enderecoErrors: Record<string, string> = {};
    const requiredEnderecoFields = ['estado', 'cidade', 'bairro', 'rua', 'numero', 'codigoPostal'];
    
    requiredEnderecoFields.forEach(field => {
      if (!formData.endereco[field as keyof Endereco]?.trim()) {
        const fieldName = field === 'codigoPostal' ? 'CEP' : field;
        enderecoErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} é obrigatório`;
        isValid = false;
      }
    });

    if (Object.keys(enderecoErrors).length > 0) {
      newErrors.endereco = enderecoErrors;
    }

    const telefoneErrors: (string | undefined)[] = [];
    formData.telefones.forEach((tel, index) => {
      if (!tel.ddd.trim() || !tel.numero.trim()) {
        telefoneErrors[index] = 'DDD e número são obrigatórios';
        isValid = false;
      }
    });

    if (telefoneErrors.length > 0) {
      newErrors.telefones = telefoneErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1] as keyof Omit<Endereco, 'id' | 'informacoesAdicionais'>;
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        }
      }));
      
      if (errors.endereco?.[field]) {
        setErrors(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            [field]: undefined
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (errors[name as keyof Omit<FormErrors, 'endereco' | 'telefones'>]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleTelefoneChange = (index: number, field: keyof Telefone, value: string) => {
    setFormData(prev => {
      const newTelefones = [...prev.telefones];
      newTelefones[index] = { ...newTelefones[index], [field]: value };
      return { ...prev, telefones: newTelefones };
    });
    
    if (errors.telefones?.[index]) {
      setErrors(prev => {
        const newTelefoneErrors = [...(prev.telefones || [])];
        newTelefoneErrors[index] = undefined;
        return { ...prev, telefones: newTelefoneErrors };
      });
    }
  };

  const addTelefone = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, { ddd: '', numero: '' }]
    }));
  };

  const removeTelefone = (index: number) => {
    if (formData.telefones.length > 1) {
      setFormData(prev => ({
        ...prev,
        telefones: prev.telefones.filter((_, i) => i !== index)
      }));
      
      if (errors.telefones?.[index]) {
        setErrors(prev => {
          const newTelefoneErrors = [...(prev.telefones || [])];
          newTelefoneErrors.splice(index, 1);
          return { ...prev, telefones: newTelefoneErrors };
        });
      }
    }
  };

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    
    if (!match) return value;
    
    return [
      match[1] ? match[1] : '',
      match[2] ? `.${match[2]}` : '',
      match[3] ? `.${match[3]}` : '',
      match[4] ? `-${match[4]}` : ''
    ].join('');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formattedValue }));
    
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando submit...');
    
    if (!validateForm()) {
      console.log('Validação falhou', errors);
      return;
    }
    
    setIsSubmitting(true);
    console.log('Enviando dados:', formData);
    
    try {
      const dataToSend = {
        nome: formData.nome,
        nomeSocial: formData.nomeSocial || undefined,
        email: formData.email || undefined,
        cpf: formData.cpf.replace(/\D/g, ''),
        endereco: {
          estado: formData.endereco.estado,
          cidade: formData.endereco.cidade,
          bairro: formData.endereco.bairro,
          rua: formData.endereco.rua,
          numero: formData.endereco.numero,
          codigoPostal: formData.endereco.codigoPostal,
          informacoesAdicionais: formData.endereco.informacoesAdicionais || undefined
        },
        telefones: formData.telefones.filter(tel => tel.ddd && tel.numero)
      };

      console.log('Dados preparados para envio:', dataToSend);

      if (formData.id) {
        await apiClient.atualizarCliente(formData.id, dataToSend);
      } else {
        await apiClient.criarCliente(dataToSend);
      }
      
      console.log('Cliente salvo com sucesso');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      console.log('Stack trace:', error.stack);
      alert('Erro inesperado: veja o console');
      
      if (error.response?.data?.error) {
        console.log('Erro do servidor:', error.response.data.error);
        if (error.response.data.error.includes('Email')) {
          setErrors(prev => ({ ...prev, email: error.response.data.error }));
        } else if (error.response.data.error.includes('CPF')) {
          setErrors(prev => ({ ...prev, cpf: error.response.data.error }));
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('Erro ao salvar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const enderecoFields = ['estado', 'cidade', 'bairro', 'rua', 'numero', 'codigoPostal'] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        {formData.id ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-800">Nome Completo *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400">
              <FiUser className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2.5 bg-blue-50 border ${
                errors.nome ? 'border-red-500' : 'border-blue-300'
              } rounded-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Nome completo"
            />
          </div>
          {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
        </div>

        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-800">Nome Social</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400">
              <FiUser className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="nomeSocial"
              value={formData.nomeSocial || ''}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome social (opcional)"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-800">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400">
              <FiMail className="h-5 w-5" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2.5 bg-blue-50 border ${
                errors.email ? 'border-red-500' : 'border-blue-300'
              } rounded-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="email@exemplo.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="relative">
          <label className="block mb-2 text-sm font-medium text-gray-800">CPF *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-400">
              <FiCreditCard className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              maxLength={14}
              placeholder="000.000.000-00"
              className={`w-full pl-10 pr-3 py-2.5 bg-blue-50 border ${
                errors.cpf ? 'border-red-500' : 'border-blue-300'
              } rounded-lg text-gray-800 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          {errors.cpf && <p className="mt-1 text-sm text-red-500">{errors.cpf}</p>}
        </div>
      </div>

      {/* Demais campos como endereço e telefone seguem o mesmo padrão de substituição */}

      <div className="flex justify-end space-x-3 pt-3">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition duration-300 disabled:opacity-50"
          >
            <FiX className="h-5 w-5" />
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50"
        >
          {isSubmitting ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiSave className="h-5 w-5" />
          )}
          {formData.id ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;