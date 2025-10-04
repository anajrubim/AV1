import { StatusEtapa } from "../enums/StatusEtapa";

export class Etapa {
    public funcionarios: string[] = [];
    public status: StatusEtapa = StatusEtapa.PENDENTE;
    
    constructor(public id: string, public nome: string) {}

    iniciarEtapa(): void {
        this.status = StatusEtapa.ANDAMENTO;
    }

    finalizarEtapa(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    associarFuncionario(funcionarioId: string): void {
        if (!this.funcionarios.includes(funcionarioId)) {
            this.funcionarios.push(funcionarioId);
        }
    }

    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            status: this.status,
            funcionarios: this.funcionarios
        };
    }

    static fromJSON(json: any): Etapa {
        const etapa = new Etapa(json.id, json.nome);
        etapa.status = json.status;
        etapa.funcionarios = json.funcionarios || [];
        return etapa;
    }
}
