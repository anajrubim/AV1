import { Funcionario } from "../entities/Funcionario";
import { NivelPermissao } from "../enums/NivelPermissao";

export class SistemaAutenticacao {
    private funcionarios: Funcionario[] = [];
    private usuarioLogado: Funcionario | null = null;

    constructor() {
        this.carregarFuncionarios();
    }

    cadastrarFuncionario(funcionario: Funcionario): void {
        if (!this.funcionarios.find(f => f.id === funcionario.id || f.usuario === funcionario.usuario)) {
            this.funcionarios.push(funcionario);
            this.salvarFuncionarios();
        }
    }

    login(usuario: string, senha: string): boolean {
        const funcionario = this.funcionarios.find(f => f.autenticar(usuario, senha));
        if (funcionario) {
            this.usuarioLogado = funcionario;
            return true;
        }
        return false;
    }

    logout(): void {
        this.usuarioLogado = null;
    }

    getUsuarioLogado(): Funcionario | null {
        return this.usuarioLogado;
    }

    temPermissao(nivelRequerido: NivelPermissao): boolean {
        if (!this.usuarioLogado) return false;
        
        const niveis = [NivelPermissao.OPERADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.ADMINISTRADOR];
        return niveis.indexOf(this.usuarioLogado.nivelPermissao) >= niveis.indexOf(nivelRequerido);
    }

    private salvarFuncionarios(): void {

    }

    private carregarFuncionarios(): void {
        
    }
}