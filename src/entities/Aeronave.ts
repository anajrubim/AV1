import { TipoAeronave } from '../enums/TipoAeronave';
import { Teste } from './Teste';
import { Peca } from './Peca';
import { Etapa } from './Etapa';
import { Funcionario } from './Funcionario';

export class Aeronave {
    public pecas: string[] = [];
    public etapas: string[] = [];
    public testes: Teste[] = [];

    constructor(
        public id: string,
        public codigo: string,
        public modelo: string,
        public tipo: TipoAeronave,
        public capacidade: number,
        public alcance: number
    ) {}

    adicionarPeca(pecaId: string): void {
        if (!this.pecas.includes(pecaId)) {
            this.pecas.push(pecaId);
        }
    }

    adicionarEtapa(etapaId: string): void {
        if (!this.etapas.includes(etapaId)) {
            this.etapas.push(etapaId);
        }
    }

    adicionarTeste(teste: Teste): void {
        this.testes.push(teste);
    }

    exibirDetalhes(pecasList: Peca[], etapasList: Etapa[], funcionariosList: Funcionario[]): string {
        const pecasDetalhes = this.pecas.map(pecaId => {
            const peca = pecasList.find(p => p.id === pecaId);
            return peca ? `- ${peca.nome} (${peca.tipo}) - ${peca.status}` : `- Peça ${pecaId} (não encontrada)`;
        }).join('\n');

        const etapasDetalhes = this.etapas.map(etapaId => {
            const etapa = etapasList.find(e => e.id === etapaId);
            if (!etapa) return `- Etapa ${etapaId} (não encontrada)`;
            
            const funcionariosEtapa = etapa.funcionarios.map(funcId => {
                const func = funcionariosList.find(f => f.id === funcId);
                return func ? func.nome : `Funcionário ${funcId}`;
            }).join(', ');
            
            return `- ${etapa.nome} - ${etapa.status} [${funcionariosEtapa || 'Nenhum funcionário'}]`;
        }).join('\n');

        const testesDetalhes = this.testes.map(teste => 
            `- ${teste.tipo}: ${teste.resultado}`
        ).join('\n');

        return `
AERONAVE ${this.codigo}
Modelo: ${this.modelo}
Tipo: ${this.tipo}
Capacidade: ${this.capacidade}
Alcance: ${this.alcance} km

PECAS (${this.pecas.length}):
${pecasDetalhes || 'Nenhuma peça associada'}

ETAPAS (${this.etapas.length}):
${etapasDetalhes || 'Nenhuma etapa associada'}

TESTES (${this.testes.length}):
${testesDetalhes || 'Nenhum teste registrado'}`;
    }

    toJSON() {
        return {
            id: this.id,
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance,
            pecas: this.pecas,
            etapas: this.etapas,
            testes: this.testes.map(t => t.toJSON())
        };
    }

    static fromJSON(json: any): Aeronave {
        const aeronave = new Aeronave(
            json.id,
            json.codigo,
            json.modelo,
            json.tipo,
            json.capacidade,
            json.alcance
        );
        aeronave.pecas = json.pecas || [];
        aeronave.etapas = json.etapas || [];
        aeronave.testes = (json.testes || []).map((t: any) => Teste.fromJSON(t));
        return aeronave;
    }
}