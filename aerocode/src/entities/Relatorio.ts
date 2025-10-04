import { Aeronave } from "./Aeronave";
import * as fs from 'fs';

export class Relatorio {
    constructor(
        public aeronave: Aeronave,
        public cliente: string,
        public dataEntrega: Date
    ) {}

    gerarRelatorio(): string {
        return `
RELATÓRIO FINAL DE AERONAVE
============================

DADOS DA AERONAVE:
${this.aeronave.exibirDetalhes()}

CLIENTE: ${this.cliente}
DATA DE ENTREGA: ${this.dataEntrega.toLocaleDateString()}

RESUMO DA PRODUÇÃO:
- Total de peças: ${this.aeronave.pecas.length}
- Total de etapas: ${this.aeronave.etapas.length}
- Total de testes: ${this.aeronave.testes.length}
- Etapas concluídas: ${this.aeronave.etapas.filter(e => e.status.toString().includes('Concluída')).length}

STATUS FINAL: ${this.aeronave.etapas.every(e => e.status.toString().includes('Concluída')) ? 'PRONTA PARA ENTREGA' : 'EM PRODUÇÃO'}
        `;
    }

    salvarRelatorio(): void {
        const relatorio = this.gerarRelatorio();
        const nomeArquivo = `relatorio_${this.aeronave.codigo}_${new Date().toISOString().split('T')[0]}.txt`;
        
        fs.writeFileSync(`data/${nomeArquivo}`, relatorio, 'utf8');
        console.log(`Relatório salvo em: data/${nomeArquivo}`);
    }
}