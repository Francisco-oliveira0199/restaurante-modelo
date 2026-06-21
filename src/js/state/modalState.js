export const modalState = {

  modo: "compra-direta",

  item: {
    nome: "",
    sabor: null
  },

  precoBase: 0,

  config: {
    quantidade: 1,
    sabor1: null,
    sabor2: null,
    meioMeio: false,
    borda: null,
    bebida: null,
    ponto: null,
    extras: [],
    massa: null,
    observacoes: ""
  },

  endereco: {
    rua: "",
    bairro: "",
    numero: "",
    complemento: ""
  },

  checkoutItens: [],

  comprandoDoCarrinho: false
};

export function resetState() {

  modalState.item = {
    nome: "",
    sabor: null
  };

  modalState.precoBase = 0;

  modalState.config = {
    quantidade: 1,
    sabor1: null,
    sabor2: null,
    meioMeio: false,
    borda: null,
    bebida: null,
    ponto: null,
    extras: [],
    massa: null,
    observacoes: ""
  };

  modalState.endereco = {
    rua: "",
    bairro: "",
    numero: "",
    complemento: ""
  };

  modalState.checkoutItens = [];

  modalState.comprandoDoCarrinho = false;

  modalState.modo = "compra-direta";
}