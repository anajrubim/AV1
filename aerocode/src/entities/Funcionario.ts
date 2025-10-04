import { NivelPermissao } from "../enums/NivelPermissao";

export class Funcionario {
    constructor(
        public id: string,
        public nome: string,
        public telefone: string,
        public endereco: string,
        public usuario: string,
        public senha: string,
        public nivelPermissao: NivelPermissao
    ) {}

    autenticar(usuario: string, senha: string): boolean {
        return this.usuario === usuario && this.senha === senha;
    }

    salvarDados(): string {
        return `${this.id},${this.nome},${this.telefone},${this.endereco},${this.usuario},${this.senha},${this.nivelPermissao}`;
    }

    static carregarDados(dados: string): Funcionario {
        const [id, nome, telefone, endereco, usuario, senha, nivelPermissao] = dados.split(',');
        return new Funcionario(id, nome, telefone, endereco, usuario, senha, nivelPermissao as NivelPermissao);
    }
}