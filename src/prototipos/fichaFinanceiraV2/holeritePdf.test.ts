import { describe, expect, it } from "vitest";
import { gerarHoleritePdf, nomeArquivoHolerite, type HoleriteDados } from "./holeritePdf";
const base: HoleriteDados={nome:"ANTONIA SILVA",cpf:"234.567.890-12",competencia:"10/2026",folha:"1",descricaoFolha:"Folha Mensal",vinculo:"32274/002",orgao:"SEDUC - Secretaria de Estado de Educação",campos:[{label:"Cargo/Função",valor:"Professora"},{label:"Tipo de Vínculo",valor:"Contrato Temporário"},{label:"Regime Jurídico",valor:"Contrato administrativo temporário"}],rubricas:[{codigo:"1040",descricao:"Subsídios",vantagem:8060.48},{codigo:"5330",descricao:"INSS",desconto:494.05},{codigo:"9900",descricao:"Imposto de Renda",desconto:1626.41}],vantagens:8060.48,descontos:2120.46,liquido:5940.02,simulacao:true,emissao:new Date("2026-11-09T12:00:00Z")};
describe("holerite PDF",()=>{
  it("padroniza nomes sem CPF e preserva números reais de folha",()=>{
    expect(nomeArquivoHolerite(base)).toBe("Holerite_Antonia_Silva_10-2026_F01_32274-002.pdf");
    expect(nomeArquivoHolerite({...base,nome:"MARIA COSTA",vinculo:undefined})).toBe("Holerite_Maria_Costa_10-2026_F01.pdf");
    expect(nomeArquivoHolerite({...base,nome:"  JOÃO  D'ÁVILA / ? ",folha:"123"})).toBe("Holerite_Joao_Davila_10-2026_F123_32274-002.pdf");
  });
  it("omite campos ausentes e inclui Carreira apenas quando informada",()=>{
    const sem=gerarHoleritePdf({...base,campos:[...base.campos,{label:"Carreira",valor:undefined}]}).pdf.output();
    expect(sem).not.toContain("Carreira");
    expect(sem).not.toContain("Categoria");
    const com=gerarHoleritePdf({...base,campos:[...base.campos,{label:"Carreira",valor:"Gestao Governamental"}]}).pdf.output();
    expect(com).toContain("Carreira"); expect(com).toContain("Gestao Governamental");
  });
  it("preserva valores processados e pagina rubricas sem perder cabeçalhos ou totais",()=>{
    const gerado=gerarHoleritePdf({...base,rubricas:Array.from({length:100},(_,i)=>({...base.rubricas[0],codigo:String(i)}))});
    expect(gerado.pdf.getNumberOfPages()).toBeGreaterThan(1);
    const texto=gerado.pdf.output();
    expect(texto.match(/Complemento/g)?.length).toBe(gerado.pdf.getNumberOfPages()-1);
    expect(texto).toContain("8.060,48");expect(texto).toContain("5.940,02");
    expect(texto).not.toContain("Código de validação:");
    expect(gerado.nome).toBe("Holerite_Antonia_Silva_10-2026_F01_32274-002.pdf");
  });
});
