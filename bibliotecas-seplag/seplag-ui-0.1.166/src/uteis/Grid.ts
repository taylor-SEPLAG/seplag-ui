export default function classesCssSeplag(colunas: string) {
  // Verifica se a valor passado está nulo ou vazio
  const cols = colunas ? String(colunas).trim().split(/\s+/) : [];
  // Inicializa a variavel que armazena as classes
  let classes = "";
  // Pega os valores das classes
  if (cols[0]) classes += ` col-${cols[0]}`;
  if (cols[1]) classes += ` md:col-${cols[1]}`;
  if (cols[2]) classes += ` lg:col-${cols[2]}`;

  return classes;
}
