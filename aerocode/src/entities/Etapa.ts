import { StatusEtapa } from "../enums/StatusEtapa";
import { Funcionario } from "./Funcionario";

export class Etapa {
    public funcionarios: Funcionario[] = [];
    public status: StatusEtapa = StatusEtapa.PENDENTE;

    constructor(
        public nome: string,
        public prazo: Date
    ) {}

    iniciarEtapa(): void {
        this.status = StatusEtapa.ANDAMENTO;
    }

    finalizarEtapa(): void {
        this.status = StatusEtapa.CONCLUIDA;
    }

    associarFuncionario(funcionario: Funcionario): void {
        if (!this.funcionarios.find(f => f.id === funcionario.id)) {
            this.funcionarios.push(funcionario);
        }
    }

    listarFuncionarios(): Funcionario[] {
        return this.funcionarios;
    }

    salvarDados(): string {
        const funcionariosIds = this.funcionarios.map(f => f.id).join(';');
        return `${this.nome},${this.prazo.toISOString()},${this.status},${funcionariosIds}`;
    }
}