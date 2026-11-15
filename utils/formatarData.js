export function formatarData(iso) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
