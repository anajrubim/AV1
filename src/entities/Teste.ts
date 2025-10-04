import { TipoTeste } from "../enums/TiposTeste";
import { ResultadoTeste } from "../enums/ResultadosTeste";

export class Teste {
    constructor(
        public id: string,
        public tipo: TipoTeste,
        public resultado: ResultadoTeste
    ) {}

    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            resultado: this.resultado
        };
    }

    static fromJSON(json: any): Teste {
        return new Teste(
            json.id,
            json.tipo,
            json.resultado
        );
    }
}
