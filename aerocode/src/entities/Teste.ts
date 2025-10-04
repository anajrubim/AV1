import { TipoTeste } from "../enums/TipoTeste";
import { ResultadoTeste } from "../enums/ResultadoTeste";

export class Teste {
    constructor(
        public tipo: TipoTeste,
        public resultado: ResultadoTeste
    ) {}

    salvarDados(): string {
        return `${this.tipo},${this.resultado}`;
    }

    static carregarDados(dados: string): Teste {
        const [tipo, resultado] = dados.split(',');
        return new Teste(tipo as TipoTeste, resultado as ResultadoTeste);
    }
}