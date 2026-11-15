import { useEffect, useState } from 'react';

// Devolve o valor só depois que ele parou de mudar por `atraso` ms.
// Usado na busca: a API é chamada quando a pessoa para de digitar, não a cada letra.
export function useValorAtrasado(valor, atraso = 400) {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const cronometro = setTimeout(() => setAtrasado(valor), atraso);
    return () => clearTimeout(cronometro);
  }, [valor, atraso]);

  return atrasado;
}
