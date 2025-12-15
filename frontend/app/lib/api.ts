/**
 * Função helper para fazer requisições à API com autenticação JWT
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `http://localhost:3001/api${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    // Token inválido - limpar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    // Redirecionar para login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Função para fazer requisições GET com autenticação
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições POST com autenticação
 */
export async function apiPost<T>(
  endpoint: string,
  body: any
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições PUT com autenticação
 */
export async function apiPut<T>(
  endpoint: string,
  body: any
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições DELETE com autenticação
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}
