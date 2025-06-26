import axios, { type AxiosError } from 'axios';

export interface ProcessedError {
  success: false;
  messageKey: string;
  rawMessage?: string;
  errors?: Record<string, string[]>;
}

export function handleAxiosError(error: unknown): ProcessedError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const responseData = axiosError.response?.data;

    console.error('[API Error]', {
      status: axiosError.response?.status,
      data: responseData,
      config: axiosError.config,
    });

    let message = responseData?.message || axiosError.message;
    const status = axiosError.response?.status;

    if (status === 419) {
      message = 'Sua sessão expirou. Por favor, atualize a página e tente novamente.';
    } else if (status === 403) {
      message = responseData?.message || "Acesso negado. Você não tem permissão para realizar esta ação.";
    } else if (status === 401) {
      message = responseData?.message || 'Não autenticado.';
    } else if (status === 422) {
      message = responseData?.message || 'Os dados fornecidos são inválidos.';
    }

    return {
      success: false,
      messageKey: 'general.apiError',
      rawMessage: message,
      errors: responseData?.errors,
    };
  }

  // Fallback for non-Axios errors
  const err = error as Error;
  console.error('[Non-API Error]', err);
  return {
    success: false,
    messageKey: 'general.unexpectedError',
    rawMessage: err.message || 'Ocorreu um erro inesperado.',
  };
}
