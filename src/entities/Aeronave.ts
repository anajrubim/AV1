import { TipoAeronave } from "../enums/TipoAeronave";
import { Peca } from "./Peca";
import { Etapa } from "./Etapa";
import { Teste } from "./Teste";

export class Aeronave {
    public pecas: Peca[] = [];
    public etapas: Etapa[] = [];
    public testes: Teste[] = [];

    constructor(
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number
    ) {}

    adicionarPeca(peca: Peca): void {
        this.pecas.push(peca);
    }

    adicionarEtapa(etapa: Etapa): void {
        this.etapas.push(etapa);
    }

    adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }

    exibirDetalhes(): string {
        return `
AERONAVE ${this.codigo}
Modelo: ${this.modelo}
Tipo: ${this.tipo}
Capacidade: ${this.capacidade} pessoas
Alcance: ${this.alcance} km

PEÇAS (${this.pecas.length}):
${this.pecas.map(peca => `- ${peca.nome} (${peca.tipo}) - ${peca.status}`).join('\n')}

ETAPAS (${this.etapas.length}):
${this.etapas.map(etapa => `- ${etapa.nome} - ${etapa.status}`).join('\n')}

TESTES (${this.testes.length}):
${this.testes.map(teste => `- ${teste.tipo}: ${teste.resultado}`).join('\n')}
        `;
    }

    salvarDados(): string {
        const pecasData = this.pecas.map(p => p.salvarDados()).join('|');
        const etapasData = this.etapas.map(e => e.salvarDados()).join('|');
        const testesData = this.testes.map(t => t.salvarDados()).join('|');
        
        return `${this.codigo},${this.modelo},${this.tipo},${this.capacidade},${this.alcance}|${pecasData}|${etapasData}|${testesData}`;
    }
}