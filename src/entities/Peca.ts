import { TipoPeca } from "../enums/TipoPeca";
import { StatusPeca } from "../enums/StatusPeca";

export class Peca {
    constructor(
        public nome: string,
        public tipo: TipoPeca,
        public fornecedor: string,
        public status: StatusPeca = StatusPeca.EM_PRODUCAO
    ) {}

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
    }

    salvarDados(): string {
        return `${this.nome},${this.tipo},${this.fornecedor},${this.status}`;
    }

    static carregarDados(dados: string): Peca {
        const [nome, tipo, fornecedor, status] = dados.split(',');
        return new Peca(nome, tipo as TipoPeca, fornecedor, status as StatusPeca);
    }
}