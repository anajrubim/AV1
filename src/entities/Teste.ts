import { TipoTeste } from '../enums/TipoTeste';
import { ResultadoTeste } from '../enums/ResultadoTeste';

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