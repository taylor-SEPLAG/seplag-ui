// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { lerDocumento } from './documentosSolicitacao';
it('lê o PDF preservando nome, conteúdo e tamanho para o lançamento', async () => {
  const documento = await lerDocumento(new File(['%PDF-1.4'], 'atestado.pdf', { type: 'application/pdf' }));
  expect(documento.nome).toBe('atestado.pdf');
  expect(atob(documento.conteudoEmBase64)).toBe('%PDF-1.4');
  expect(documento.tamanho).toBe(8);
});
it('rejeita formatos incompatíveis e arquivos acima do limite', async () => {
  await expect(lerDocumento(new File(['texto'], 'documento.txt', { type: 'text/plain' }))).rejects.toThrow('PDF');
  await expect(lerDocumento(new File([new Uint8Array(10000001)], 'grande.pdf', { type: 'application/pdf' }))).rejects.toThrow('10MB');
});
it('aceita documentos Word com ou sem tipo informado pelo navegador', async () => {
  expect((await lerDocumento(new File(['documento'], 'atestado.doc', { type: 'application/msword' }))).extensao).toBe('doc');
  expect((await lerDocumento(new File(['documento'], 'atestado.docx'))).contentType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});
