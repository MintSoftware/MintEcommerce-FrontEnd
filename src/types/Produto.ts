import { UUID } from "crypto";
import { Categoria } from "./Categoria";

export type Produto = {
    id : UUID;
    nome : string;
    status : boolean;
    descricao : string;
    preco : number;
    quantidade : number;
    quantidadeestoque : number;
    imagem : string;
    categoria : Categoria;
    temFrete: boolean;
};