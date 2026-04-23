const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Faz fetch com retry automático por exponential backoff.
 * Só tenta novamente em erros 5xx ou falhas de rede — nunca em 4xx (erro do cliente).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  { maxRetries = 3, initialDelay = 600 }: { maxRetries?: number; initialDelay?: number } = {}
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(input, init)

      // Não retenta erros do cliente (4xx)
      if (res.ok || (res.status >= 400 && res.status < 500)) return res

      // 5xx: aguarda e tenta de novo
      if (attempt < maxRetries) {
        const jitter = Math.random() * 300
        await delay(initialDelay * 2 ** attempt + jitter)
        continue
      }
      return res
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        const jitter = Math.random() * 300
        await delay(initialDelay * 2 ** attempt + jitter)
      }
    }
  }

  throw lastError ?? new Error('Falha na requisição após múltiplas tentativas')
}
