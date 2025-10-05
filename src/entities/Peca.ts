import { TipoPeca } from '../enums/TipoPeca';
import { StatusPeca } from '../enums/StatusPeca';

export class Peca {
    constructor(
        public id: string,
        public nome: string,
        public tipo: TipoPeca,
        public status: StatusPeca = StatusPeca.EM_PRODUCAO
    ) {}

    atualizarStatus(novoStatus: StatusPeca): void {
        this.status = novoStatus;
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            tipo: this.tipo,
            status: this.status
        };
    }

    static fromJSON(json: any): Peca {
        return new Peca(
            json.id,
            json.nome,
            json.tipo,
            json.status
        );
    }
}